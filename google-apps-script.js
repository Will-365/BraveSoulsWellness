/**
 * BRAVE SOULS WELLNESS - GOOGLE APPS SCRIPT
 *
 * HOW TO USE:
 * 1. Go to your Google Sheet → Extensions → Apps Script
 * 2. Delete all existing code, paste this entire file
 * 3. Save (Ctrl+S)
 * 4. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5. Authorize, copy the Web App URL, paste into your HTML files
 *
 * GOOGLE SHEET SETUP:
 * Make sure Row 1 of your sheet has these exact headers:
 * Timestamp | First Name | Last Name | Email Address | WhatsApp Number | Program | Biggest Challenge | Source
 */

// ─── Handle GET requests (Dashboard reads data) ───────────────────────────────
function doGet(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    var data  = sheet.getDataRange().getValues();

    if (data.length <= 1) {
      return buildResponse({ status: "success", data: [] });
    }

    var jsonData = [];
    for (var i = 1; i < data.length; i++) {
      var row = data[i];
      // Columns: 0=Timestamp, 1=FirstName, 2=LastName, 3=Email, 4=WhatsApp, 5=Program, 6=Challenge, 7=Source
      if (!row[1] && !row[3]) continue; // skip fully empty rows

      var ts = row[0];
      if (Object.prototype.toString.call(ts) === '[object Date]') {
        ts = Utilities.formatDate(ts, Session.getScriptTimeZone(), "yyyy-MM-dd hh:mm a");
      }

      jsonData.push({
        timestamp : ts,
        firstName : row[1],
        lastName  : row[2],
        email     : row[3],
        whatsapp  : row[4],
        program   : row[5],
        challenge : row[6],
        source    : row[7]
      });
    }

    jsonData.reverse(); // newest first
    return buildResponse({ status: "success", data: jsonData });

  } catch (err) {
    return buildResponse({ status: "error", message: err.toString() });
  }
}

// ─── Handle POST requests (Website forms send data) ───────────────────────────
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];

    // Parse the JSON body sent from the website
    var body = JSON.parse(e.postData.contents);

    var timestamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyy-MM-dd hh:mm a");

    // Append a new row in fixed column order
    sheet.appendRow([
      timestamp,
      body.firstName  || "",
      body.lastName   || "",
      body.email      || "",
      body.whatsapp   || "",
      body.program    || "",
      body.challenge  || "",
      body.source     || ""
    ]);

    return buildResponse({ status: "success", message: "Row saved!" });

  } catch (err) {
    return buildResponse({ status: "error", message: err.toString() });
  }
}

// ─── Helper: Build a JSON response with CORS headers ─────────────────────────
function buildResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

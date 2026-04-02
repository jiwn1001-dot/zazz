/**
 * Google Apps Script Web App Template for Post-it App
 * 
 * [Setup Instructions]
 * 1. Go to your Google Sheet: https://docs.google.com/spreadsheets/d/1UITun-dywjSZP11eUhmjs8qghOb1sHDejBej7f20OIs/edit
 * 2. Click Extensions > Apps Script
 * 3. Delete any existing code and paste this entire file.
 * 4. Click Save (Ctrl+S).
 * 5. Click "Deploy" > "New Deployment"
 * 6. Select type: "Web app"
 *    - Execute as: "Me"
 *    - Who has access: "Anyone"
 * 7. Click Deploy, Authorize access, and copy the Web App URL.
 * 8. The copied URL should match the one in your .env.local file!
 */

const SHEET_NAME = '시트1'; // Your sheet name. Change to 'Sheet1' if required.

function doPost(e) {
  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.getSheets()[0];
    
    // Parse the incoming JSON payload from Next.js server
    const postData = JSON.parse(e.postData.contents);
    const action = postData.action; 
    const data = postData.data;
    
    // Ensure header row exists
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['timestamp', 'datetime', 'category', 'content', 'color']);
      sheet.getRange(1, 1, 1, 5).setFontWeight("bold");
    }
    
    if (action === 'create') {
      // Append new row
      sheet.appendRow([
        data.timestamp || '',
        data.datetime || '',
        data.category || '',
        data.content || '',
        data.color || ''
      ]);
      
    } else if (action === 'update' || action === 'delete') {
      // Find the row by ID (timestamp) in Column A
      const dataRange = sheet.getDataRange();
      const values = dataRange.getValues();
      let rowIndex = -1;
      
      // Start from 1 to skip header
      for (let i = 1; i < values.length; i++) {
        // String conversion for robust matching
        if (String(values[i][0]) === String(data.timestamp)) { 
          rowIndex = i + 1; // Google Sheet rows are 1-indexed
          break;
        }
      }
      
      if (rowIndex !== -1) {
        if (action === 'delete') {
          sheet.deleteRow(rowIndex);
        } else if (action === 'update') {
          // Update the specific row based on columns: [timestamp, datetime, category, content, color]
          const range = sheet.getRange(rowIndex, 1, 1, 5);
          range.setValues([[
            data.timestamp || values[rowIndex-1][0],
            data.datetime || values[rowIndex-1][1],
            data.category || values[rowIndex-1][2],
            data.content || values[rowIndex-1][3],
            data.color || values[rowIndex-1][4]
          ]]);
        }
      }
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: "success", action: action, id: data.timestamp }))
                         .setMimeType(ContentService.MimeType.JSON);
                         
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
                         .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handling typical CORS preflight if needed for direct browser calls (currently we proxy through Next.js)
function doOptions(e) {
  return ContentService.createTextOutput()
                       .setMimeType(ContentService.MimeType.TEXT);
}

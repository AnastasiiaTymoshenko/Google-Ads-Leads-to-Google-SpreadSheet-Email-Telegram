function init()
{
   tableId = 'your tableId';   
   googleKey = "your googleKey";
   ss = SpreadsheetApp.openById(tableId);
   leadsSheet = ss.getSheetByName('Leads');  

   emailAddress = "your email address"; 

   telegramToken = "your telegram token";   
   telegramId = "your telegram id";  
}

function doPost(e){
   init();  
   let dataFromGoogleAds = JSON.parse(e.postData.contents);
   let date = new Date().toISOString().slice(0,10);
   let userColumnData = dataFromGoogleAds.user_column_data;
   let formId = dataFromGoogleAds.form_id;
   let header = getCurrentTableHeader();
   let userColumnDataNew = changeDataArray(userColumnData);
   if (dataFromGoogleAds.google_key == googleKey)
   { 
     let row = [date,formId];       
     header = updateHeader(header, userColumnData);     
     for(i=2;i<header.length;i++)
     {
       row.push(userColumnDataNew.hasOwnProperty(header[i]) ? userColumnDataNew[header[i]] : "");
     }          
     leadsSheet.appendRow(row);     
     sendMail(userColumnData, date, formId);
     sendDataToTelegram(userColumnData, date, formId);
   }    
}

function getCurrentTableHeader(){
  init();
  let lastColumn = leadsSheet.getLastColumn();  
  let tableHeader = [];
  if(lastColumn == 0)
  {
    tableHeader = ["Date", "Form ID"];
  }
  else
  {
    let range = leadsSheet.getRange(1,1,1,lastColumn);
    let values = range.getValues();
    tableHeader = values[0];
  }  
  return tableHeader;
}

function updateHeader(header, userColumnData){
  for(i=0;i<userColumnData.length;i++)
       {
         if(!header.includes(userColumnData[i].column_name))
         {
           header.push(userColumnData[i].column_name);           
         } 
       }  
  let values = [];
  values[0] = header;
  leadsSheet.getRange(1, 1, 1, header.length).setValues(values);
  return header;
    
}

function changeDataArray(userColumnData){  
   let userColumnDataNew = [];
   for(i=0;i<userColumnData.length;i++)
   {
     userColumnDataNew[userColumnData[i].column_name] = userColumnData[i].string_value;
   }
   return userColumnDataNew;
}

function sendMail(userColumnData, date, formId) 
{  
  let message = ("New lead information: " + "<br />").bold();
  message = message + "Date: " + date + "<br />" + "Form ID: " + formId + "<br />";  
  for(i=0;i<userColumnData.length;i++)
  {
    message = message + userColumnData[i].column_name + ": " + userColumnData[i].string_value + "<br />";
  }
  let subject = "New lead from Google Ads!";
  MailApp.sendEmail({
    to: emailAddress,
    subject: subject,
    htmlBody: message
  });
}

function sendDataToTelegram(userColumnData, date, formId) 
{  
  let telegramUrl = "https://api.telegram.org/bot" + telegramToken;    
  let message = ("New lead information: " + '\n').bold(); 
  message = message + "Date: " + date + '\n' + "Form ID: " + formId + '\n';  
  for(i=0;i<userColumnData.length;i++)
  {
    message = message + userColumnData[i].column_name + ": " + userColumnData[i].string_value + '\n';
  }
  let url = telegramUrl + "/sendMessage?chat_id=" + telegramId + "&parse_mode=html&text=" + message;  
  let response = UrlFetchApp.fetch(encodeURI(url));
}

var CHANNEL_ACCESS_TOKEN = 'your line toen';

function doPost(e) {

  try{
    var msg = JSON.parse(e.postData.contents);
    console.log(msg);

    var reply_msg = '';

    // 取出 replayToken 和發送的訊息文字
    var replyToken = msg.events[0].replyToken;
    var userMessage = msg.events[0].message.text;
    var reply_obj = searchSuggest(userMessage);
    if(reply_obj[0] ==''){
      reply_msg = '無此食品建議。';
    }

    if (typeof replyToken === 'undefined') {
      return;
    }

    
    //有圖傳圖，沒圖傳文字
    if(reply_obj[1] != ''){  
      reply_msg = reply_obj[1];
      doReplyImage(reply_msg,replyToken);
    }else{
      reply_msg = reply_obj[0]
      doReplyText(reply_msg,replyToken);
    }
  }catch(e){
    doReplyText('error : '+ e,replyToken);
    write_log(e);
  }
  
}

function searchSuggest(food_name){

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('資料表');

  var response = new Array();
  
  var reply_msg= '';
  var image_url ='';
  var data = sheet.getDataRange().getValues();

  data.forEach(function(row){
    if(row[0].includes(food_name)){
      reply_msg = reply_msg + "["+row[0]+"]\n 模式:"+row[1]+"\n 火力:"+row[2]+"\n 時間:"+row[3]+"\n 包裝建議:"+row[4]+"\n 心得:"+row[5]+"\n\n";
      response.push(reply_msg);
      image_url = row[6];
      response.push(image_url);
      
    }
  });

  return response;


}

//回傳文字訊息
function doReplyText(msg,token){
  var url = 'https://api.line.me/v2/bot/message/reply';
  UrlFetchApp.fetch(url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': token,
      'messages': [{
        'type': 'text',
        'text': msg
      }],
    }),
  });
}

//回傳文字訊息
function doReplyImage(image_url,token){
  var url = 'https://api.line.me/v2/bot/message/reply';
  UrlFetchApp.fetch(url, {
    'headers': {
      'Content-Type': 'application/json; charset=UTF-8',
      'Authorization': 'Bearer ' + CHANNEL_ACCESS_TOKEN,
    },
    'method': 'post',
    'payload': JSON.stringify({
      'replyToken': token,
      'messages': [{
        'type': 'image',
        'originalContentUrl': image_url,
        'previewImageUrl': image_url
      }],
    }),
  });
}

function write_log(data){
  var sheetApp = SpreadsheetApp.getActiveSpreadsheet(); 
  var logSheet=sheetApp.getSheetByName('log');
  var now = new Date();
  var lastRow = logSheet.getLastRow()+1;
  
  try{
    logSheet.getRange(lastRow, 1).setValue(now);
    logSheet.getRange(lastRow, 2).setValue(data);
  }catch(e){

    logSheet.getRange(lastRow, 1).setValue(now);
    logSheet.getRange(lastRow, 2).setValue(e);
  }
}

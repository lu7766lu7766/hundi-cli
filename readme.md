# bundle

```bash
npx hundi-cli bundle \
-H <HOST> \
-U <USERNAME> \
-P <PASSWORD> \
-p <PORT> \
-n <PROJECT_NAME> \
-f <PROJECT_FOLDER> \
-s <SERVER_ROOT> \
-u <UPLOAD_FOLDER> \
-d <DIST_FOLDER> \
-r <URL> \
-t <TG_KEY> \
-c <TG_CHAT_ID>
```

Params description

> HOST required, ssh HOST  
> USER_NANE required, ssh USERNAME  
> PASSWORD required, ssh PASSWORD  
> PORT required, ssh PORT  
> PROJECT_NAME required, telegram message title, etc: 76 or 76dev  
> PROJECT_FOLDER required, etc: 41c or web or df  
> SERVER_ROOT required, etc: www or /var/www/html  
> UPLOAD_FOLDER optional, etc: download, default: .  
> DIST_FOLDER optional, etc: dist or df, default: dist  
> URL optional, it will unzip to remote if without value, or just send message. etc: https://domain.com  
> TG_KEY optional, Telegram Bot Key  
> TG_CHAT_ID optional, Telegram chat id  
> ps. nodejs version > 18

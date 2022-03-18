#SETTINGS
$outpath = ".\outfile.json"
$assignmentid = "62018b5b3bbf980020a0f271"
$OptanonAlertBoxClosed = "2022-03-17T20:29:41.124Z"
$connectsid = "s%3A86F2qmlXYUt8nfoo14aesox65ULGQgbq.4IoB2H7pVXC2TBHzgD0AjZuzYxpv4RTEnq5xbkCndnI"
$OptanonConsent = "isIABGlobal=false&datestamp=Thu+Mar+17+2022+21%3A53%3A33+GMT-0400+(Eastern+Daylight+Time)&version=6.29.0&hosts=&consentId=5949f429-77ad-4c64-9fd6-7289101a11f9&interactionCount=1&landingPath=NotLandingPage&groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0&geolocation=US%3BGA&AwaitingReconsent=false"

#DONT CHANGE
$session = New-Object Microsoft.PowerShell.Commands.WebRequestSession
$session.UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.109 Safari/537.36 OPR/84.0.4316.36"
$session.Cookies.Add((New-Object System.Net.Cookie("OptanonAlertBoxClosed", $OptanonAlertBoxClosed, "/", ".pivotinteractives.com")))
$session.Cookies.Add((New-Object System.Net.Cookie("connect.sid", $connectsid, "/", ".pivotinteractives.com")))
$session.Cookies.Add((New-Object System.Net.Cookie("OptanonConsent", $OptanonConsent, "/", ".pivotinteractives.com")))
$Response = Invoke-WebRequest -UseBasicParsing -Uri ("https://api.pivotinteractives.com/api/v3/assignments/"+$assignmentid+"/response?_xff=editor") `
-WebSession $session `
-Headers @{
"sec-ch-ua"="`" Not A;Brand`";v=`"99`", `"Chromium`";v=`"98`", `"Opera GX`";v=`"84`""
  "Accept"="application/json, text/plain, */*"
  "sec-ch-ua-mobile"="?0"
  "sec-ch-ua-platform"="`"Windows`""
  "Origin"="https://app.pivotinteractives.com"
  "Sec-Fetch-Site"="same-site"
  "Sec-Fetch-Mode"="cors"
  "Sec-Fetch-Dest"="empty"
  "Referer"="https://app.pivotinteractives.com/"
  "Accept-Encoding"="gzip, deflate, br"
  "Accept-Language"="en-US,en;q=0.9"
}
$Response.Content | Out-File $outpath

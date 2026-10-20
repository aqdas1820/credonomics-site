import http.server,http.client,re
class Handler(http.server.BaseHTTPRequestHandler):
 def log_message(self,*args):pass
 def handle_route(self):
  path=self.path
  allowed=(self.command=='GET' and (path in ['/','/health'] or re.fullmatch(r'/pay/i/[A-Za-z0-9_-]+\.[A-Za-z0-9_-]{43}(?:/(?:status|qr\.svg))?',path))) or (self.command=='POST' and path=='/demo')
  if not allowed:
   self.send_response(404);self.send_header('Content-Length','0');self.end_headers();return
  try:
   size=int(self.headers.get('Content-Length','0'))
   if size<0 or size>16384:raise ValueError()
   data=self.rfile.read(size) if size else None
   headers={k:self.headers[k] for k in ['Origin','Content-Type','CF-Connecting-IP'] if self.headers.get(k)}
   conn=http.client.HTTPConnection('127.0.0.1',8090,timeout=10)
   conn.request(self.command,path,body=data,headers=headers);r=conn.getresponse();data=r.read(1024*1024+1)
   if len(data)>1024*1024:raise ValueError()
   self.send_response(r.status)
   for k,v in r.getheaders():
    if k.lower() not in ['connection','transfer-encoding','content-length','server','date']:self.send_header(k,v)
   self.send_header('Content-Length',str(len(data)));self.end_headers();self.wfile.write(data);conn.close()
  except Exception:
   self.send_response(502);self.send_header('Content-Length','0');self.end_headers()
 def do_GET(self):self.handle_route()
 def do_POST(self):self.handle_route()
http.server.ThreadingHTTPServer(('127.0.0.1',8088),Handler).serve_forever()

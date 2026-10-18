#!/usr/bin/env python3
"""Prepare public release assets from a verified local APK; never copies keys/logs."""
import hashlib,os,re,shutil,subprocess,sys
from pathlib import Path
apk=Path(sys.argv[1]);notes=Path(sys.argv[2]);out=Path('.artifacts/github-release');out.mkdir(parents=True,exist_ok=True)
sdk=Path(os.environ['ANDROID_HOME'])/'build-tools/35.0.0'
subprocess.run([str(sdk/'apksigner'),'verify',str(apk)],check=True)
line=subprocess.check_output([str(sdk/'aapt'),'dump','badging',str(apk)],text=True).splitlines()[0]
package=re.search("name='([^']+)'",line)[1];version=re.search("versionName='([^']+)'",line)[1];code=int(re.search("versionCode='(\\d+)'",line)[1])
if package!='app.rivestream.tv' or not re.fullmatch(r'\d+\.\d+\.\d+',version):raise SystemExit('Only stable Rivestream TV releases may be published')
major,minor,patch=map(int,version.split('.'))
if minor>99 or patch>99 or code!=major*10000+minor*100+patch:raise SystemExit('versionCode must equal major*10000+minor*100+patch')
old=Path('Rivestream-TV-1.4.1.apk')
if old.exists():
 def signer(p):
  text=subprocess.check_output([str(sdk/'apksigner'),'verify','--print-certs',str(p)],text=True)
  return re.findall(r'Signer #\d+ certificate SHA-256 digest: (\w+)',text)
 if not signer(apk) or signer(apk)!=signer(old):raise SystemExit('Signing key differs from the previously distributed APK')
sha=hashlib.sha256(apk.read_bytes()).hexdigest()
for stale in ('update.json','sha256sum.txt'):(out/stale).unlink(missing_ok=True)
shutil.copyfile(apk,out/'Rivestream-TV.apk');shutil.copyfile(apk,Path(f'Rivestream-TV-{version}.apk'))
print('v'+version,sha)

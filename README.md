
```
node examples/forced_password_change.js .env.yml |& tee logs/`date +%Y_%m_%d` | less
node examples/import_and_query.js .env.yml |& tee logs/`date +%Y_%m_%d` | less
```

Where .env.yaml is: 
```
PoolId: us-east-1_YuTF9ST4J
AppClientId: 6ctsnjjglmtna2q5fgtrjug47k
ApiBaseUrl: https://lze4t3ladb.execute-api.us-east-1.amazonaws.com/dev
Username: john_hoffer@hms.harvard.edu
Password: <DesiredPassword>
TemporaryPassword: <TempPassword>
PreferredUsername: john_hoffer@hms.harvard.edu
FilePath: </file/to/upload>
Name: John Hoffer
```

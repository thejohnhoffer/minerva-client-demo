```
npm i
```

Example usage with logging (see all scripts in `package.json`):

```
npm run list_repositories | tee logs/`date +%Y_%m_%d` | less
```

Make sure .env.yaml is of the form: 
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

# This is a work-in-progress

As of 2019-02-01, `forced_password_change` and `import_and_query` have not yet been run with current minerva client dependency.
Also, the `list_repositories` feature is marked TODO in minerva-infrastructure, and the API Gateway endpoint does not even seem to exist.

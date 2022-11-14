# nest-hashing
Simple hashing 

## Install

```sh
npm install @lahirwisada/nest-hashing --save
```

## Register to Module
```
AcaktextModule.forRoot({
    secretKey: 'GOo7cVgnCBnR8TvXIgvamXNb85cPVtJi', //required length must 32 characters string
    algorithm: 'AES-256-CBC', //optional
    sha: 'sha256', //optional
    enabled: true
  })
```


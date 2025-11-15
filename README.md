# DW-BI

## Prerequesites
Have docker already installed and running or a mysql instance ready to go

## Getting started
Coppy paste those commands:
```
docker run --name dwbi -p 3306:3306 -d -e MYSQL_ROOT_PASSWORD=change-me mysql:latest
sleep 15
docker exec -i dwbi mysql -uroot -p'change-me' < init-db.sql
```

## No sql developer tools you can play with db via cmdline:
```
docker exec -it dwbi mysql -uroot -p'change-me'
```

## Connecting to it via _sqldeveloper_, _dbeaver_ or anything else:
Make sure you have those values properly set:

<img width="672" height="727" alt="image" src="https://github.com/user-attachments/assets/e65e1324-ff09-48c6-9607-458fa9bf871c" />

> Note: If you get this error: "Public Key Retrieval is not allowed" in the same connection tab:

<img width="687" height="732" alt="image" src="https://github.com/user-attachments/assets/1d541058-3718-4bfb-b455-e768f3db434d" />



## Backup
Execute `docker exec -it dwbi mysqldump -uroot -p'change-me' --add-drop-table --add-drop-database dwbi | tail -n +2 > dwbi.sql` this will create a dump of you specified db.


## Clean-up
If you wish to leave your computer clean you can simply run `docker rm -f dwbi` but be aware any changes/data in this database will be lost if you don't backup.


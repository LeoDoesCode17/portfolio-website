# /fastapi/Dockerfile
FROM python:3.12-slim
WORKDIR /usr/src/fastapi

COPY requirements.txt /usr/src/fastapi/requirements.txt
RUN pip install -r /usr/src/fastapi/requirements.txt

COPY ./app /usr/src/fastapi/app/
COPY ./alembic /usr/src/fastapi/alembic
COPY ./alembic.ini /usr/src/fastapi/alembic.ini

COPY entrypoint.sh /usr/src/fastapi/entrypoint.sh
RUN chmod +x /usr/src/fastapi/entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
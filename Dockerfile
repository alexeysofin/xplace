FROM python:3.8.6-slim-buster

ENV PYTHONUNBUFFERED 1

RUN apt-get update -y \
    && apt-get install -y curl git gcc postgresql-client libpq-dev \
    zlib1g-dev libtiff-dev libfreetype6 libfreetype6-dev \
    libwebp-dev libopenjp2-7-dev libopenjp2-7-dev \
    && pip install -U pip poetry

RUN useradd -ms /bin/bash -d /app app

WORKDIR /app

# copy the dependencies file to the working directory
COPY xplace/requirements.txt .

# install dependencies
RUN pip install -r requirements.txt

# copy the content of the local src directory to the working directory
COPY xplace/ .

COPY scripts/entrypoints/ /

ENTRYPOINT [ "/run.sh" ]

FROM node:19 AS frontend

WORKDIR /app
COPY package.json .
RUN npm install
COPY . .
RUN npm run build

FROM composer:2.4.4 as build
WORKDIR /app
COPY . /app/
RUN composer install --prefer-dist --no-dev --optimize-autoloader --no-interaction

FROM php:8.1-apache-buster as production

ENV APP_ENV=production
ENV APP_DEBUG=false


RUN apt-get update && apt-get install -y \
    postgresql libpq-dev

RUN docker-php-ext-configure opcache --enable-opcache && \
    docker-php-ext-install pdo pdo_pgsql
COPY docker/php/conf.d/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

COPY --from=build /app /var/www/html
COPY --from=frontend /app/public/build /var/www/html/public/build
COPY docker/000-default.conf /etc/apache2/sites-available/000-default.conf

WORKDIR /var/www/html
RUN php artisan route:clear && php artisan config:clear && php artisan cache:clear && php artisan view:clear
RUN rm -rf storage/logs/*
RUN php artisan config:cache
RUN php artisan route:cache
RUN php artisan migrate

RUN chown -R www-data:www-data /var/www/ && \
    chmod 777 -R /var/www/html/storage && \
    a2enmod rewrite

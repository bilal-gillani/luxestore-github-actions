FROM nginxinc/nginx-unprivileged:stable-alpine3.23-slim

# Patch OS packages and clear the default site content (needs root)
USER root
RUN apk upgrade --no-cache \
    && rm -rf /usr/share/nginx/html/*

# The image entrypoint runs envsubst on /etc/nginx/templates/*.template at
# startup and writes the result to /etc/nginx/conf.d/. Only BACKEND_URL is
# substituted, so nginx's own $uri, $host, etc. are left alone.
ENV NGINX_ENVSUBST_FILTER=BACKEND_URL
COPY nginx.conf.template /etc/nginx/templates/default.conf.template

# Static files stay root-owned, so the nginx user can read but not modify them
COPY . /usr/share/nginx/html

# Drop privileges (numeric UID so Kubernetes/ACA runAsNonRoot checks pass)
USER 101

EXPOSE 8080

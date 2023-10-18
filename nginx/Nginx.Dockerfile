FROM nginx:latest

#RUN rm /etc/nginx/conf.d/default.conf
RUN rm /etc/nginx/conf.d/default.conf

#COPY ../../ngingx.conf to /etc/nginx/conf.d
COPY ../../nginx.conf /etc/nginx/conf.d

#EXPOSE port 80
EXPOSE 80

#nginx start
CMD ["nginx", "-g", "daemon off;"]
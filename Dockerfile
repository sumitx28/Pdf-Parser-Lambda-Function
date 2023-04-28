FROM public.ecr.aws/lambda/nodejs:18

WORKDIR ${LAMBDA_TASK_ROOT}

# Install required packages
RUN yum -y install gcc-c++ make libpng-devel libjpeg-devel libtiff-devel wget tar gzip libpng libjpeg libtiff ghostscript freetype freetype-devel jasper jasper-devel
RUN wget https://sourceforge.net/projects/graphicsmagick/files/graphicsmagick/1.3.38/GraphicsMagick-1.3.38.tar.gz \
        && tar -zxvf GraphicsMagick-1.3.38.tar.gz \
        && rm GraphicsMagick-1.3.38.tar.gz
RUN ./GraphicsMagick-1.3.38/configure --prefix=/var/task/graphicsmagick --enable-shared=no --enable-static=yes
RUN make
RUN make install
RUN tar -zcvf ~/graphicsmagick.tgz /var/task/graphicsmagick/
ENV PATH="${PATH}:/var/task/graphicsmagick/bin"

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

EXPOSE 8080

ENTRYPOINT [ "/lambda-entrypoint.sh" ]

CMD [ "dist/app.handler" ]
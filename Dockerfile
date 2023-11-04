# Dockerfile

# 1. 운영체제 설치(node 18버전과 npm과 yarn이 모두 설치되어있는 리눅스)
FROM node:18-alpine

# 2. 내 컴퓨터에 있는 폴더나 파일을 도커 컴퓨터 안으로 복사하기
# 명령어를 실행할 워크 디렉토리 생성
RUN mkdir /app
WORKDIR /app

# 프로젝트 전체를 워크 디렉토리에 추가
COPY . /app

# 프로젝트에 사용되는 모듈 설치
RUN npm install

# # Artillery 설치
# RUN npm install -g artillery

# RUN npm install uuid

# Prisma 클라이언트 생성
RUN npx prisma generate

# Nest.js 빌드
RUN npm run build

# Port (3000) 개방
EXPOSE 4000
# 서버 실행
ENTRYPOINT ["npm"]
CMD ["run", "start:dev"]
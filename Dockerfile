FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci

# Ensure production env values are present at build-time for Vite.
COPY .env.production ./.env.production

COPY . .
RUN test -f .env.production
RUN npm run build

FROM nginx:stable-alpine
# 빌드된 정적 파일 복사
COPY --from=build /app/dist /usr/share/nginx/html

# [핵심] 이 줄을 반드시 추가하세요!
# 위에서 만든 nginx.conf를 Nginx 기본 설정 위치로 복사합니다.
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

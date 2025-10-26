# Glossary Service (gRPC + Vue + Postgres)

Полноценный сервис «Глоссарий»: gRPC API (grpc-web через grpcwebproxy), SPA на Vue 3, хранение в Postgres, доставка через Docker Compose. Поддерживаются операции:

- Список терминов
- Термин по ключевому слову
- Добавление/обновление/удаление термина
- Управление связями между терминами (создание/список/изменение/удаление)

Для gRPC используется protobuf-схема `app/protos/glossary.proto` и Python-реализация сервера `app/grpc_server.py`.

## Архитектура
- backend: gRPC (grpcio, grpcio-tools), Pydantic, SQLAlchemy, Alembic (авто-миграции при старте)
- grpc-web: включён через grpcwebproxy (порт 8081), переводит браузерные grpc-web запросы в gRPC
- frontend: Vue 3 + TypeScript + Vite (Cytoscape — граф связей)
- db: Postgres 16

Типы связей:
- `is-a` → «является»
- `part-of` → «часть»
- `related-to` → «связан с»
- `synonym-of` → «синоним»
- `derived-from` → «происходит от»


## gRPC API
- Protobuf: `backend/app/protos/glossary.proto`
- Сервис: `glossary.v1.GlossaryService`
- Порт gRPC: `50051` (в контейнере `backend`, проброшен на localhost)
- grpc-web endpoint: `http://localhost:8081`

### Примеры работы (grpcurl)
Сервер поддерживает reflection, поэтому можно вызывать методы напрямую:


Примеры:

```bash

# Создание термина
$ grpcurl -plaintext -d '{"term":"AI","definition":"..."}' \
    localhost:50051 glossary.v1.GlossaryService/CreateTerm
{
  "id": "1",
  "term": "AI",
  "definition": "...",
  "source": {},
  "created_at": "2025-10-26T17:59:17.310716",
  "updated_at": "2025-10-26T17:59:17.310736"
}

# Список терминов
$ grpcurl -plaintext -d '{"query":"", "limit":10, "offset":0}' \
    localhost:50051 glossary.v1.GlossaryService/ListTerms
{
  "items": [
    {
      "id": "1",
      "term": "AI",
      "definition": "...",
      "source": {},
      "created_at": "2025-10-26T17:59:17.310716",
      "updated_at": "2025-10-26T17:59:17.310736"
    }
  ]
}

```

Методы:
- Health
- ListTerms / GetTermByKeyword / CreateTerm / UpdateTerm / DeleteTerm
- CreateRelation / UpdateRelation / DeleteRelation / ListRelations
- GetGraph

Генерация Python-стабов выполняется на этапе сборки образа (Dockerfile). При старте контейнера выполняются Alembic миграции.

### Пример использования (Python, вне проекта)
```python
import grpc
from glossary.v1 import glossary_pb2 as pb, glossary_pb2_grpc as pb_grpc

channel = grpc.insecure_channel("localhost:50051")
stub = pb_grpc.GlossaryServiceStub(channel)
resp = stub.ListTerms(pb.ListTermsRequest(query="ai", limit=10))
print(len(resp.items))
```

### Пример grpc-web (браузер)
Фронтенд использует `grpc-web` по адресу `http://localhost:8081` (grpcwebproxy).

### Генерация фронтовых stubs (локально)

```bash
cd frontend
mkdir -p src/gen
protoc -I protos protos/glossary.proto \
  --js_out=import_style=commonjs,binary:src/gen \
  --grpc-web_out=import_style=typescript,mode=grpcweb:src/gen
```

Но с фронтендом не удалось подружить с тайпскриптом генерируемые файлы
Ошибка остается открытой к решению

### Как устроено взаимодействие и почему нужен прокси
- gRPC использует HTTP/2, бинарное фреймирование и трейлеры, которые браузеры не позволяют вызывать напрямую из JavaScript.
- Протокол `grpc-web` адаптирует gRPC под возможности браузера (HTTP/1.1/Fetch, CORS), инкапсулируя бинарные сообщения в совместимый формат.
- В этом проекте переводчиком выступает grpcwebproxy: браузер → grpc-web → grpcwebproxy:8081 → gRPC → backend:50051.
- Благодаря этому фронтенд (Vue) может вызывать методы `GlossaryService` как обычные HTTP-запросы к 8081, а прокси транслирует их в настоящие gRPC-вызовы к бэкенду.


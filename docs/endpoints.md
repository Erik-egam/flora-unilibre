# Endpoints y datos de prueba

Guía para probar la API de Flora Unilibre (Next.js). Todos los ejemplos usan
`http://localhost:3000`; cambia el puerto si arrancas con `PORT=...`.

## Arrancar el servidor

```bash
cd /home/darkdev/Projects/flora-unilibre-next
pnpm dev
```

La base de datos está vacía (`familia`, `especie`, `planta` y `flora` en 0), así
que el orden de siembra importa: familias → especies → plantas → flora.

## Resumen de endpoints

| Método | Ruta | Query / Body | Respuesta correcta |
| --- | --- | --- | --- |
| `GET` | `/` | — | `200` `Hello World!` |
| `GET` | `/health` | — | `200` `{status:"ok",supabase:"up"}` / `503` degradado |
| `GET` | `/familias` | `q`, `limit`, `offset` | `200` página |
| `GET` | `/familias/:id` | — | `200` / `404` |
| `POST` | `/familias` | `nombre`, `descripcion?` | `201` |
| `PATCH` | `/familias/:id` | campos parciales | `200` |
| `DELETE` | `/familias/:id` | — | `204` / `409` |
| `GET` | `/especies` | `familiaId`, `q`, `limit`, `offset` | `200` página |
| `GET` | `/especies/:id` | — | `200` / `404` |
| `POST` | `/especies` | `familiaId`, `nombreCientifico`, `descripcion?` | `201` |
| `PATCH` | `/especies/:id` | campos parciales | `200` |
| `DELETE` | `/especies/:id` | — | `204` / `409` |
| `GET` | `/plantas` | `especieId`, `q`, `limit`, `offset` | `200` página |
| `GET` | `/plantas/:id` | — | `200` / `404` |
| `POST` | `/plantas` | `especieId`, `nombreComun`, `descripcion?`, `imgUrl?` | `201` |
| `PATCH` | `/plantas/:id` | campos parciales | `200` |
| `DELETE` | `/plantas/:id` | — | `204` / `409` |
| `GET` | `/flora` | `plantaId`, `estado`, `limit`, `offset` | `200` página |
| `GET` | `/flora/:id` | — | `200` / `404` |
| `POST` | `/flora` | `id`, `plantaId`, `latitud`, `longitud`, `imgUrl?`, `estado?` | `201` |
| `PATCH` | `/flora/:id` | `plantaId?`, `latitud?`, `longitud?`, `imgUrl?`, `estado?` | `200` |
| `DELETE` | `/flora/:id` | — | `204` |

Los listados devuelven el envelope:

```json
{ "data": [], "total": 0, "limit": 20, "offset": 0 }
```

## Reglas de validación

| Campo | Regla |
| --- | --- |
| `limit` | entero entre `1` y `100` (default `20`) |
| `offset` | entero `>= 0` (default `0`) |
| `q` | búsqueda case-insensitive sobre `nombre`, `nombreCientifico` o `nombreComun` según el recurso |
| `nombre` / `nombreComun` | 1–100 caracteres |
| `nombreCientifico` | 1–150 caracteres |
| `descripcion` | hasta 5000 caracteres, opcional o `null` |
| `imgUrl` | URL válida, hasta 500 caracteres, opcional o `null` |
| `familiaId` / `especieId` / `plantaId` | entero `>= 1` y debe existir |
| `estado` | `vivo` \| `enfermo` \| `muerto` \| `talado` (default `vivo`) |
| `latitud` | `-90` a `90`, máximo 6 decimales |
| `longitud` | `-180` a `180`, máximo 6 decimales |
| `id` de flora | número de placa, entero `>= 1`; **inmutable** en `PATCH` |

Los cuerpos y query params desconocidos se rechazan con `400` (`strictObject`).

## Datos de prueba

Siembra en este orden. Los IDs asumidos corresponden a una base recién vacía.

| Recurso | ID | Datos |
| --- | --- | --- |
| Familia | 1 | `Myrtaceae` |
| Familia | 2 | `Fabaceae` |
| Especie | 1 | `Eucalyptus grandis W.Hill ex Maiden` → familia 1 |
| Especie | 2 | `Psidium guajava L.` → familia 1 |
| Especie | 3 | `Phaseolus vulgaris L.` → familia 2 |
| Planta | 1 | `Eucalipto` → especie 1 |
| Planta | 2 | `Guayabo` → especie 2 |
| Planta | 3 | `Fríjol` → especie 3 |
| Flora | 50 | planta 1, `4.609710`, `-74.081750`, `vivo` |
| Flora | 51 | planta 1, `4.610000`, `-74.082000`, `enfermo` |
| Flora | 52 | planta 2, `4.611110`, `-74.083330`, `muerto` |
| Flora | 53 | planta 3, `4.612340`, `-74.084560`, `talado` |

### Familias

```bash
curl -s -X POST http://localhost:3000/familias \
  -H 'content-type: application/json' \
  -d '{"nombre":"Myrtaceae","descripcion":"Familia de mirtáceas"}'

curl -s -X POST http://localhost:3000/familias \
  -H 'content-type: application/json' \
  -d '{"nombre":"Fabaceae","descripcion":"Familia de leguminosas"}'
```

### Especies

```bash
curl -s -X POST http://localhost:3000/especies \
  -H 'content-type: application/json' \
  -d '{"familiaId":1,"nombreCientifico":"Eucalyptus grandis W.Hill ex Maiden","descripcion":"Árbol de gran porte"}'

curl -s -X POST http://localhost:3000/especies \
  -H 'content-type: application/json' \
  -d '{"familiaId":1,"nombreCientifico":"Psidium guajava L.","descripcion":"Guayabo"}'

curl -s -X POST http://localhost:3000/especies \
  -H 'content-type: application/json' \
  -d '{"familiaId":2,"nombreCientifico":"Phaseolus vulgaris L.","descripcion":"Fríjol común"}'
```

### Plantas

```bash
curl -s -X POST http://localhost:3000/plantas \
  -H 'content-type: application/json' \
  -d '{"especieId":1,"nombreComun":"Eucalipto","descripcion":"Ejemplar adulto","imgUrl":"https://images.example.com/eucalipto.jpg"}'

curl -s -X POST http://localhost:3000/plantas \
  -H 'content-type: application/json' \
  -d '{"especieId":2,"nombreComun":"Guayabo"}'

curl -s -X POST http://localhost:3000/plantas \
  -H 'content-type: application/json' \
  -d '{"especieId":3,"nombreComun":"Fríjol"}'
```

### Flora (placas)

```bash
curl -s -X POST http://localhost:3000/flora \
  -H 'content-type: application/json' \
  -d '{"id":50,"plantaId":1,"latitud":4.60971,"longitud":-74.08175,"estado":"vivo"}'

curl -s -X POST http://localhost:3000/flora \
  -H 'content-type: application/json' \
  -d '{"id":51,"plantaId":1,"latitud":4.61000,"longitud":-74.08200,"estado":"enfermo"}'

curl -s -X POST http://localhost:3000/flora \
  -H 'content-type: application/json' \
  -d '{"id":52,"plantaId":2,"latitud":4.61111,"longitud":-74.08333,"estado":"muerto"}'

curl -s -X POST http://localhost:3000/flora \
  -H 'content-type: application/json' \
  -d '{"id":53,"plantaId":3,"latitud":4.61234,"longitud":-74.08456,"estado":"talado"}'
```

> Si omites `estado`, la base lo deja en `vivo`.

## Consultas

```bash
# Listados y paginación
curl -s 'http://localhost:3000/familias?limit=2&offset=0'
curl -s 'http://localhost:3000/familias?q=myr'
curl -s 'http://localhost:3000/especies?familiaId=1&q=euc'
curl -s 'http://localhost:3000/plantas?especieId=1'
curl -s 'http://localhost:3000/flora?plantaId=1&estado=vivo'
curl -s 'http://localhost:3000/flora?estado=enfermo'

# Detalle con relaciones
curl -s 'http://localhost:3000/especies/1'   # incluye familia
curl -s 'http://localhost:3000/plantas/1'    # incluye especie + familia
curl -s 'http://localhost:3000/flora/50'     # incluye planta + especie + familia
```

## Actualizaciones

```bash
curl -s -X PATCH http://localhost:3000/familias/2 \
  -H 'content-type: application/json' \
  -d '{"descripcion":"Leguminosas actualizadas"}'

curl -s -X PATCH http://localhost:3000/especies/1 \
  -H 'content-type: application/json' \
  -d '{"descripcion":"Eucalipto actualizado"}'

curl -s -X PATCH http://localhost:3000/plantas/1 \
  -H 'content-type: application/json' \
  -d '{"nombreComun":"Eucalipto rojo"}'

curl -s -X PATCH http://localhost:3000/flora/50 \
  -H 'content-type: application/json' \
  -d '{"estado":"enfermo","latitud":4.609800}'
```

## Bajas (respetando dependencias)

```bash
curl -s -X DELETE http://localhost:3000/flora/53
curl -s -X DELETE http://localhost:3000/plantas/3
curl -s -X DELETE http://localhost:3000/especies/3
curl -s -X DELETE http://localhost:3000/familias/2
```

## Casos de error

```bash
# 400: limit fuera de rango
curl -i 'http://localhost:3000/familias?limit=0'

# 400: campo desconocido
curl -i -X POST http://localhost:3000/familias \
  -H 'content-type: application/json' \
  -d '{"nombre":"X","id":1}'

# 400: falta un campo obligatorio
curl -i -X POST http://localhost:3000/especies \
  -H 'content-type: application/json' \
  -d '{"nombreCientifico":"Sin familia"}'

# 400: id no numérico
curl -i http://localhost:3000/familias/abc

# 404: recurso inexistente
curl -i http://localhost:3000/familias/999999

# 409: nombre duplicado (después de sembrar Myrtaceae)
curl -i -X POST http://localhost:3000/familias \
  -H 'content-type: application/json' \
  -d '{"nombre":"Myrtaceae"}'

# 409: borrar una familia que todavía tiene especies
curl -i -X DELETE http://localhost:3000/familias/1

# 400: intentar cambiar el id de placa en PATCH
curl -i -X PATCH http://localhost:3000/flora/50 \
  -H 'content-type: application/json' \
  -d '{"id":51}'

# 400: más de 6 decimales en coordenadas
curl -i -X POST http://localhost:3000/flora \
  -H 'content-type: application/json' \
  -d '{"id":54,"plantaId":1,"latitud":4.6097101,"longitud":-74.08175}'

# 404 JSON para ruta inexistente
curl -i http://localhost:3000/no-existe

# Health: la DB funciona; el anon key actual devuelve 401 en Supabase
curl -i http://localhost:3000/health
```

## Formato de error

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": ["nombre is required"]
}
```

`message` puede ser un string (errores de negocio o `404`) o un array (fallos de
validación). Los errores de Prisma se traducen así: `409` para unicidad y claves
foráneas (`P2002`/`P2003`), `404` para filas inexistentes en escritura (`P2025`)
y `400` para campos/relaciones obligatorias (`P2011`/`P2014`).

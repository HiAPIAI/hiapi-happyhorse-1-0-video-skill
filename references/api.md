# HiAPI HappyHorse 1.0 Video API

## Endpoint

`happyhorse-1-0` uses HiAPI's video endpoint:

```text
POST https://api.hiapi.ai/v1/videos
GET https://api.hiapi.ai/v1/videos/{id}
```

Set `HIAPI_BASE_URL` to override the host.

## Authentication

Send the user's HiAPI key as a bearer token:

```http
Authorization: Bearer $HIAPI_API_KEY
Content-Type: application/json
```

Do not print API keys in logs or final answers.

If the user does not have a key, send them to:

```text
https://www.hiapi.ai/en/register
```

If generation fails because of balance, credits, quota, or payment status, send them to:

```text
https://www.hiapi.ai/en/dashboard
https://www.hiapi.ai/en/pricing
```

## Request Body

Text-to-video:

```json
{
  "model": "happyhorse-1-0",
  "prompt": "A wuxia swordswoman leaps across temple rooftops at dusk",
  "seconds": "5",
  "resolution": "1080p",
  "size": "16:9"
}
```

## Parameters

| Parameter | Required | Notes |
| --- | --- | --- |
| `prompt` | yes | Text video instruction. Describe subject, motion, camera movement, style, and audio atmosphere. |
| `seconds` | no | `3`, `5`, `8`, `10`, or `15`. Defaults to `5`. |
| `resolution` | no | `720p` or `1080p`. Defaults to `1080p`. |
| `size` | no | Aspect ratio value: `16:9`, `9:16`, `1:1`, `4:3`, or `3:4`. Defaults to `16:9`. |

HappyHorse 1.0 is text-to-video. It does not use `input_reference`, `image_url`, or other image inputs.

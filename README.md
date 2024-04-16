# Typescript Keycloak Authorization Validator.
**This Repo is still WIP.** 

A small tool based on NodeJS to track and synchronize client authorizations in Keycloak.

## Disclaimer
I'm not a typescript developer, I'm mainly trying things and exploring while trying to solve an issue.

## Purpose
If you have worked a bit with Keycloak authorization in multiple staging (dev -> qua -> prd). You might have 
noticed that it's not an easy task to synchronize authorization across staging (export / import not always working as expected).  
Here, I'm trying to solve keycloak authorization synchronization across stages with a script.

## Q&A
- Why Typescript ?  
Actually planned to do it as CLI in Go. Did it in Typescript to train and try things. Also idea was to be 
able to run the script in FE based pipeline.    

A Go CLI is still planned.

## How does it works?
Compare stage n with stage n+1 authorization configuration for the same client.  
It checks:
- Resources
- Permissions


### Config File
Configuration file `./src/config/config.json` format:

**modes:**
1. **report**: only generate reports of desync resources & permissions
2. **synchronize**: generate a reports of desync resources & permissions and sync them (POST / PUT)

```json
{
  "mode": "report",
  "stages": [
    {
      "stage": 0,
      "stage_name": "stage-1",
      "hostname": "KEYCLOAK_HOSTNAME",
      "realm": "KEYCLOAK_REALM",
      "clients": ["KEYCLOAK_CLIENTS"],
      "admin_user_client": {
        "client_id": "KEYCLOAK_SERVICE_ACCOUNT_CLIENT_ID",
        "client_secret": "KEYCLOAK_SERVICE_ACCOUNT_CLIENT_SECRET"
      }
    },
    {
      "stage": 1,
      "stage_name": "stage-2",
      "hostname": "KEYCLOAK_HOSTNAME",
      "realm": "KEYCLOAK_REALM",
      "clients": ["KEYCLOAK_CLIENTS"],
      "admin_user_client": {
        "client_id": "KEYCLOAK_SERVICE_ACCOUNT_CLIENT_ID",
        "client_secret": "KEYCLOAK_SERVICE_ACCOUNT_CLIENT_SECRET"
      }
    }
  ]
}
```

## How to run for dev

# watchparty

watchparty is a simple browser-based app for watching things together in real time.

you create a room, share the link, join with your friends, start screen sharing, and watch together. the app also includes live audio, chat, mobile-friendly layouts, and a project breakdown page that explains how everything works.

## what this project does

- creates a new room with one click
- lets people join through a shared link
- supports screen sharing for videos, streams, or any browser tab
- includes live audio and chat in the room
- works across desktop, tablet, and mobile layouts
- keeps the interface lightweight instead of turning everything into a full meeting dashboard

## how it works in simple english

the app is built with next.js on the frontend and livekit for the real-time room system.

when someone creates a room, the browser opens a room page. before joining, the app asks the server for a temporary access token. that token is created using your livekit credentials on the server side, so the private keys are never exposed in the browser. once the browser gets that token, it joins the room and livekit handles the audio, video, screen sharing, and chat transport.

## tech stack

- next.js 15
- react 18
- typescript
- livekit components react
- livekit client and server sdk
- css modules for custom styling
- react hot toast for small in-app notifications

## local setup

1. install dependencies:

```bash
pnpm install
```

2. copy the example env file:

```bash
cp .env.example .env.local
```

3. fill in the required values in `.env.local`

4. start the app:

```bash
pnpm dev
```

5. open [http://localhost:3000](http://localhost:3000)

## environment variables

these are the important ones:

```env
LIVEKIT_API_KEY=
LIVEKIT_API_SECRET=
LIVEKIT_URL=
```

### what they mean

- `LIVEKIT_API_KEY`: your livekit api key
- `LIVEKIT_API_SECRET`: your livekit api secret
- `LIVEKIT_URL`: the websocket url of your livekit server or livekit cloud project

there are also optional variables in `.env.example` for recording, datadog logging, and settings menu options.

## useful scripts

```bash
pnpm dev        # start local development server
pnpm build      # create production build
pnpm start      # run production build
pnpm lint       # run linting
pnpm lint:fix   # fix lint issues where possible
pnpm test       # run tests
```

## project structure

```text
app/
  page.tsx                      landing page
  about/                        project explanation page
  api/connection-details/       creates livekit connection details
  watchparty/[roomId]/          room entry route

lib/
  WatchPartyLayout.tsx          main room interface
  useScreenShare.ts             screen-share state helpers
  useSetupE2EE.ts               optional encryption setup

styles/
  globals.css                   global tokens and livekit overrides
  Home.module.css               landing page styles
  WatchParty.module.css         room page styles
  About.module.css              about page styles
```

## main flow

1. a user opens the landing page
2. the app creates a room id
3. the user enters the room and completes the pre-join form
4. the browser calls `/api/connection-details`
5. the server creates a temporary livekit token
6. the browser joins the room with that token
7. people can talk, chat, and share their screen

## notes

- this project is dark by default
- the about page has its own local light theme option
- room links can be copied directly from the room ui
- the layout changes automatically when screen sharing starts

## credits

this project started from a livekit-based setup and was heavily redesigned and customized into a focused watchparty experience.

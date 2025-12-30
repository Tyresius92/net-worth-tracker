# Roadmap

This document is mostly a scratchpad to write down the things I want to get done for this application.

## Deploy & Hosting

### Goal

What I ultimately want to happen is to have a NodeJS application, accessible via the public internet, served from my Raspberry Pi.

### Steps to make this happen

These are the steps I think I need to take, in the order I think I need to take them.

1. Buy a new Raspberry Pi
   - I want this on a separate machine from the Pihole
1. Set up the Pi, and assign a static IP
1. Set up port forwarding on my router
1. Install and configure nginx on the Pi
1. Set up the Raspberry Pi to serve as a self-hosted runner for Github Actions
   - https://fek.io/blog/deploy-code-to-your-raspberry-pi-with-the-github-actions-runner/
1. Install and configure pm2 on the Pi
   - Same link as GH Actions
1. Configure the Github Action to deploy the app to the same machine as the runner
1. Figure out how to expose a public/external IP from my home network
   - DuckDNS is what Danny recommended, but that's an Amazon tool, and I saw some folks that just have a shell script
1. Buy a domain, configure it to point to the static IP we set up earlier (or if nginx obfuscates that somehow, then to wherever it needs to go)

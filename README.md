# SK Uplink

[![Publish Package](https://github.com/SVKruik-Organization/Uplink/actions/workflows/publish.yml/badge.svg)](https://github.com/SVKruik-Organization/Uplink/actions/workflows/publish.yml)
[![NPM Version](https://img.shields.io/npm/v/%40svkruik%2Fsk-uplink-connector?label=%40svkruik%2Fsk-uplink-connector&color=green)](https://www.npmjs.com/package/@svkruik/sk-uplink-connector)

Welcome to SK Uplink, a high-perfomance RabbitMQ communication network for internal communication between the all the different products. It handles updates, CI/CD and distribution of tasks, and functions like an hivemind. Did you upset Apricaria? Well, now Stelleri knows aswell (figure of speech, *or is it?*).

#### Directories

- `server`: The Uplink API that listens to requests from the CI/CD pipelines. It will send a RabbitMQ deployment task downstream.
- `connector`: The NPM package that all Uplink clients rely on. It provides a consistent and easy way to connect to Uplink.

---

Because a simple `README.md` can only do so much, I have also made an documentation platform, [SK Docs](https://platform.stefankruik.com/documentation). If you are serious about using my products, I highly recommend reading the relevant articles. Don't have time for that? Don't hesitate to [reach out](https://skpvt.io/r/support). I am always open to have a chat and answer questions to your heart's content, unless I am debugging deployment 😄.

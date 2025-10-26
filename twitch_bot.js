// Import tmi.js module
import tmi from 'tmi.js';
import OpenAI from 'openai';
import { promises as fsPromises } from 'fs';
import fetch from 'node-fetch';

export class TwitchBot {
    constructor(bot_username, oauth_token, channels, openai_api_key, enable_tts, refresh_token, client_id, client_secret) {
        this.channels = channels;
        this.client_id = client_id;
        this.client_secret = client_secret;
        this.refresh_token = refresh_token;
        this.oauth_token = oauth_token; // текущий access_token
        this.enable_tts = enable_tts;
        // остальной конструктор без изменений
    }

    // Метод для обновления access_token
    async refreshAccessToken() {
        try {
            const params = new URLSearchParams();
            params.append('grant_type', 'refresh_token');
            params.append('refresh_token', this.refresh_token);
            params.append('client_id', this.client_id);
            params.append('client_secret', this.client_secret);

            const res = await fetch('https://id.twitch.tv/oauth2/token', {
                method: 'POST',
                body: params
            });

            const data = await res.json();
            if (data.access_token) {
                this.oauth_token = 'oauth:' + data.access_token;
                console.log('[TwitchBot] Access token refreshed successfully.');
            } else {
                console.error('[TwitchBot] Failed to refresh token:', data);
            }
        } catch (err) {
            console.error('[TwitchBot] Error refreshing token:', err);
        }
    }

    // Метод для запуска авто-рефреша каждые 4 часа
    startTokenRefresh() {
        this.refreshAccessToken(); // сразу обновляем
        setInterval(() => this.refreshAccessToken(), 4 * 60 * 60 * 1000); // каждые 4 часа
    }
}

export class TwitchBot {
    constructor(bot_username, oauth_token, channels, openai_api_key, enable_tts) {
        this.channels = channels;
        this.client = new tmi.client({
            connection: {
                reconnect: true,
                secure: true
            },
            identity: {
                username: bot_username,
                password: oauth_token
            },
            channels: this.channels
        });
        this.openai = new OpenAI({apiKey: openai_api_key});
        this.enable_tts = enable_tts;
    }

    addChannel(channel) {
        // Check if channel is already in the list
        if (!this.channels.includes(channel)) {
            this.channels.push(channel);
            // Use join method to join a channel instead of modifying the channels property directly
            this.client.join(channel);
        }
    }

    connect() {
        // Use async/await syntax to handle promises
        (async () => {
            try {
                // Await for the connection to be established
                await this.client.connect();
            } catch (error) {
                // Handle any errors that may occur
                console.error(error);
            }
        })();
    }

    disconnect() {
        // Use async/await syntax to handle promises
        (async () => {
            try {
                // Await for the connection to be closed
                await this.client.disconnect();
            } catch (error) {
                // Handle any errors that may occur
                console.error(error);
            }
        })();
    }

    onMessage(callback) {
        this.client.on('message', callback);
    }

    onConnected(callback) {
        this.client.on('connected', callback);
    }

    onDisconnected(callback) {
        this.client.on('disconnected', callback);
    }

    say(channel, message) {
        // Use async/await syntax to handle promises
        (async () => {
            try {
                // Await for the message to be sent
                await this.client.say(channel, message);
            } catch (error) {
                // Handle any errors that may occur
                console.error(error);
            }
        })();
    }

    async sayTTS(channel, text, userstate) {
        // Check if TTS is enabled
        if (this.enable_tts !== 'true') {
            return;
        }
        try {
            // Make a call to the OpenAI TTS model
            const mp3 = await this.openai.audio.speech.create({
                model: 'tts-1',
                voice: 'alloy',
                input: text,
            });

            // Convert the mp3 to a buffer
            const buffer = Buffer.from(await mp3.arrayBuffer());

            // Save the buffer as an MP3 file
            const filePath = './public/file.mp3';
            await fsPromises.writeFile(filePath, buffer);

            // Return the path of the saved audio file
            return filePath;
        } catch (error) {
            console.error('Error in sayTTS:', error);
        }
    }

    whisper(username, message) {
        // Use async/await syntax to handle promises
        (async () => {
            try {
                // Await for the message to be sent
                await this.client.whisper(username, message);
            } catch (error) {
                // Handle any errors that may occur
                console.error(error);
            }
        })();
    }

    ban(channel, username, reason) {
        // Use async/await syntax to handle promises
        (async () => {
            try {
                // Await for the user to be banned
                await this.client.ban(channel, username, reason);
            } catch (error) {
                // Handle any errors that may occur
                console.error(error);
            }
        })();
    }

    unban(channel, username) {
        // Use async/await syntax to handle promises
        (async () => {
            try {
                // Await for the user to be unbanned
                await this.client.unban(channel, username);
            } catch (error) {
                // Handle any errors that may occur
                console.error(error);
            }
        })();
    }

    clear(channel) {
        // Use async/await syntax to handle promises
        (async () => {
            try {
                // Await for the chat to be cleared
                await this.client.clear(channel);
            } catch (error) {
                // Handle any errors that may occur
                console.error(error);
            }
        })();
    }

    color(channel, color) {
        // Use async/await syntax to handle promises
        (async () => {
            try {
                // Await for the color to be changed
                await this.client.color(channel, color);
            } catch (error) {
                // Handle any errors that may occur
                console.error(error);
            }
        })();
    }

    commercial(channel, seconds) {
        // Use async/await syntax to handle promises
        (async () => {
            try {
                // Await for the commercial to be played
                await this.client.commercial(channel, seconds);
            } catch (error) {
                // Handle any errors that may occur
                console.error(error);
            }
        })();
    }
}

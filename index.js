import 'dotenv/config'
import { LeigodAPI } from "./leigod.js";


const api = new LeigodAPI();

const usernames = process.env.USERNAME_ARR.split(',')
const passwords = process.env.PASSWORD_ARR.split(',')

if (!usernames || !passwords) {
    console.error("please set USERNAME_ARR and PASSWORD_ARR in envs (split multi user by ',')")
}

const users = [];

for (let idx = 0; idx < usernames.length; idx++) {
    const username = (usernames[idx] || '').trim();
    const password = (passwords[idx] || '').trim();
    users.push({ username, password })
}

async function pause(username, password) {
    if (username && password) {
        try {
            console.info("Login in to " + username);
            await api.login(username, password);
            let isPaused = await api.isTimePaused()
            console.info("Getting pause status: " + isPaused);
            if (!isPaused) {
                console.info("Trying to pause time");
                await api.pauseTime()
                isPaused = await api.isTimePaused()
                console.info("Getting pause status again: " + isPaused);
            }
        } catch (error) {
            console.error(error)
        }

    } else {
        console.error("username or password is empty, please check envs" + username)
    }
}

for (let idx = 0; idx < users.length; idx++) {
    const { username, password } = users[idx]
    await pause(username, password)
}



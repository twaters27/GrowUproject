const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const {check, validationResult} = require('express-validator');

const app = express();

const clientPath = path.join(__dirname, '..', 'client/src');
const dataPath = path.join(__dirname, 'data', 'users.json');
const serverPublic = path.join(__dirname, 'public');

app.use(express.static(clientPath));
app.use(express.urlencoded({extended:true}));
app.use(express.json());

app.get('/', (req,res) => {
    res.sendFile('index.html', {root:clientPath});
});

app.get('/users', async(req,res) => {
    try {
        const data = await fs.readFile(dataPath, 'utf8');

        const users = JSON.parse(data);
        if (!users) {
            throw new Error("Error no users available");
        }
        res.status(200).json(users);
    } catch (error) {
        console.error("Problem getting users" + error.message);
        res.status(500).json({error: "Problem reading users"}); 
    }
});

app.get ('/signIn', (req,res) => {
    res.sendFile('pages/form.html', {root:serverPublic});

});
app.post('/submit-make', async(req,res)=>{
    try{
        const {email, password} = req.body;
        let users = [];
        try {
            const data = await fs.readFile(dataPath, 'utf8');
            users = JSON.parse(data);
        } catch (error){
            console.error("Error reading user data:", error);
            users = [];
        }
        let user = users.find(u => u.email === email  && u.password === password);
        if (user) {
           user
        } else{
            user = {email, password};
            users.push(user);
        }
        await fs.writeFile(dataPath, JSON.stringify(users,null,2));
        res.redirect('/signIn');
    } catch (error){
        console.error('Error processing form:', error);
        res.status(500).send("An error occured while processing your submission")
    }
});

app.put('/update-user/:currentEmail/:currentPassword', async (req,res)=> {
try {
    const {currentEmail, currentPassword} = req.params;
    const { newEmail, newPassword} = req.body;
    console.log('Current user:', { currentEmail, currentPassword });
        console.log('New user data:', { newEmail, newPassword });
    const data = await fs.readFile(dataPath, 'utf8');
    if (data) {
        let users = JSON.parse(data);
        const userIndex = users.findIndex(user=> user.email === currentEmail && user.password === currentPassword);
        console.log(userIndex);
        if (userIndex === -1){
            return res.status(404).json({message : "User not found"});

        }
        users[userIndex] = {...users[userIndex], email: newEmail, password: newPassword};
        console.log(users);
        await fs.writeFile(dataPath, JSON.stringify(users,null,2));

        res.status(200).json({message: `You sent ${newEmail} and ${newPassword}`});
    }
} catch (error){
    console.error("Error updating user:", error);
    res.status(500).send("An error occurred while updating the user.");

}
});


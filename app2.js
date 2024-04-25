const express = require("express");
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const db = 'mongodb://localhost:27017/MediCare';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '')));

mongoose.connect(db).then(() => {
    console.log("Connection Successful");
}).catch((err) => {
    console.log("Connection Failed");
});



const userSchema = new mongoose.Schema({
    firstname: {
        type: String,
        required: true,
        trim: true
    },
    lastname: {
        type: String,
        required: true,
        trim: true
    },
    dob: {
        type: Date,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    phonenumber: {
        type: Number,
        unique:true
    },
    password: {
        type: String,
        required: true,
        trim: true
    },
    cpassword: {
        type: String,
        required: true,
        trim: true
    }
});

const User = mongoose.model('Registrations', userSchema);

const appointmentSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    hospital: {
        type: String,
        required: true
    },
    doctor: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    problem: {
        type:String,
        required:true
    }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

// Homepage route
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, 'homepage.html'));
});

// Registration page route
app.get("/register", (req, res) => {
    res.sendFile(path.join(__dirname, 'RegisterForm.html'));
});

// Login page route
app.get("/loggedin", (req, res) => {
    res.sendFile(path.join(__dirname, 'LoginForm.html'));
});

app.get("/userdetails", (req, res) => {
    res.sendFile(path.join(__dirname, 'UserDetails.html'));
});

app.get("/aboutus", (req, res) => {
    res.sendFile(path.join(__dirname, 'AboutUs.html'));
});
app.get("/book", (req, res) => {
    res.sendFile(path.join(__dirname, 'BookAppointment.html'));
});
app.get("/review", (req, res) => {
    res.sendFile(path.join(__dirname, 'Reviews.html'));
});

// User registration route
app.post('/register', async (req, res) => {
    try {
        const { firstname, lastname, dob, gender, email, phonenumber, password, cpassword } = req.body;
        if (!firstname || !lastname || !dob || !gender || !email || !password || !cpassword) {
            return res.status(400).send("Missing required fields");
        }

        if (password !== cpassword) {
            return res.status(400).send("Passwords do not match");
        }

        const user = new User({
            firstname,
            lastname,
            dob,
            gender,
            email,
            phonenumber,
            password,
            cpassword
        });

        await user.save();

        res.send(`
            <h2>User registered successfully!</h2>
            <p>Click <a href="/loggedin">here</a> to login.</p>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// User login route
app.post('/loggedin', bodyParser.urlencoded({ extended: false }), async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email, password });
        if (user) {
            res.redirect('/'); // Redirect to homepage upon successful login
        } else {
            res.status(401).send('Invalid Username or password ');
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



// Handle appointment submission
app.post('/book', async (req, res) => {
    try {
        // Collect data from the form
        const { fullName, gender, age, city, hospital, doctor, date, problem } = req.body;

        // Create a new appointment instance
        const appointment = new Appointment({
            fullName,
            gender,
            age,
            city,
            hospital,
            doctor,
            date,
            problem
        });

        // Save the appointment to the database
        await appointment.save();

        // Respond with a success message
        res.send(`
            <h2>Appointment booked successfully!</h2>
            <p>Appointment details:</p>
            <p>Full Name: ${fullName}</p>
            <p>Gender: ${gender}</p>
            <p>Age: ${age}</p>
            <p>City: ${city}</p>
            <p>Hospital: ${hospital}</p>
            <p>Doctor: ${doctor}</p>
            <p>Date: ${date}</p>
            <p>Problem: ${problem}</p>
        `);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(8080, () => {
    console.log("Server is running on port 8080");
});

import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { Jumbotron, Form, Button, FormGroup, Label, Input } from "reactstrap";
import firebase from "../Firebase";

function Login() {
	const history = useHistory();
	const [creds, setCreds] = useState({ nickname: "" });
	const [showLoading, setShowLoading] = useState(false);
	const ref = firebase.database().ref("users/");

	const onChange = (e) => {
		e.persist();
		setCreds({ ...creds, [e.target.name]: e.target.value });
	};
	const login = (e) => {
		e.preventDefault();
		setShowLoading(true);
		ref
			.orderByChild("nickname")
			.equalTo(creds.nickname)
			.once("value", (snapshot) => {
				if (snapshot.exists()) {
					// checking if the user exist
					localStorage.setItem("nickname", creds.nickname);
					history.push("/roomlist");
					setShowLoading(false);
				} else {
					const newUser = firebase.database().ref("users/").push(); // for creating new user
					newUser.set(creds);
					localStorage.setItem("nickname", creds.nickname);
					history.push("/roomlist");
					setShowLoading(false);
				}
			});
	};
	return (
		<Jumbotron>
			<h6 className="login-greet">Hey, Welcome To My Chat Group!</h6>
			<Form onSubmit={login}>
				<FormGroup>
					<Label
						style={{
							marginRight: "15px",
							alignSelf: "center",
							width: "110px",
						}}
					>
						Enter Name
					</Label>
					<Input
						type="text"
						name="nickname"
						id="nickname"
						placeholder="Enter Your Name"
						value={creds.nickname}
						onChange={onChange}
						style={{ marginRight: "15px" }}
					/>
					<Button variant="primary" type="submit">
						Login
					</Button>
				</FormGroup>
			</Form>
		</Jumbotron>
	);
}

export default Login;

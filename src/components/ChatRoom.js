import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
	Container,
	Row,
	Col,
	Card,
	CardBody,
	CardSubtitle,
	Button,
	Form,
	InputGroup,
	Input,
	InputGroupAddon,
} from "reactstrap";
import Moment from "moment";
import firebase from "../Firebase";
import ScrollToBottom from "react-scroll-to-bottom";
import "../Styles.css";

function ChatRoom(props) {
	const [chats, setChats] = useState([]);
	const [users, setUsers] = useState([]);
	const [nickname, setNickname] = useState("");
	const [roomname, setRoomname] = useState("");
	const [newchat, setNewchat] = useState({
		roomname: "",
		nickname: "",
		message: "",
		date: "",
		type: "",
	});
	const history = useHistory();
	const { room } = useParams();

	useEffect(() => {
		const fetchData = async () => {
			setNickname(localStorage.getItem("nickname"));
			setRoomname(room);
			firebase
				.database()
				.ref("chats/")
				.orderByChild("roomname")
				.equalTo(roomname)
				.on("value", (resp) => {
					setChats([]);
					setChats(snapshotToArray(resp));
				});
		};

		fetchData();
	}, [room, roomname]);

	useEffect(() => {
		const fetchData = async () => {
			setNickname(localStorage.getItem("nickname"));
			setRoomname(room);
			firebase
				.database()
				.ref("roomusers/")
				.orderByChild("roomname")
				.equalTo(roomname)
				.on("value", (resp2) => {
					setUsers([]);
					const roomusers = snapshotToArray(resp2);
					setUsers(roomusers.filter((x) => x.status === "online"));
				});
		};

		fetchData();
	}, [room, roomname]);

	const snapshotToArray = (snapshot) => {
		const returnArr = [];

		snapshot.forEach((childSnapshot) => {
			const item = childSnapshot.val();
			item.key = childSnapshot.key;
			returnArr.push(item);
		});

		return returnArr;
	};

	const submitMessage = (e) => {
		e.preventDefault();
		const chat = newchat;
		chat.roomname = roomname;
		chat.nickname = nickname;
		chat.date = Moment(new Date()).format("DD/MM/YYYY HH:mm:ss");
		chat.type = "message";
		const newMessage = firebase.database().ref("chats/").push();
		newMessage.set(chat); // sending message to chat with these properties

		setNewchat({
			// clear for next msg
			roomname: "",
			nickname: "",
			message: "",
			date: "",
			type: "",
		});
	};
	const onChange = (e) => {
		e.persist();
		setNewchat({
			...newchat,
			[e.target.name]: e.target.value,
		});
	};
	const exitChat = (e) => {
		const chat = {
			roomname: "",
			nickname: "",
			message: "",
			date: "",
			type: "",
		};
		chat.roomname = roomname;
		chat.nickname = nickname;
		chat.date = Moment(new Date()).format("DD/MM/YYYY HH:mm:ss");
		chat.message = `${nickname} leave the room`;
		chat.type = "exit";
		const newMessage = firebase.database().ref("chats/").push();
		newMessage.set(chat); // Exit msg after leaving room

		firebase
			.database()
			.ref("roomusers/")
			.orderByChild("roomname")
			.equalTo(roomname)
			.once("value", (resp) => {
				let roomuser = [];
				roomuser = snapshotToArray(resp); // updating array of online users
				const user = roomuser.find((x) => x.nickname === nickname);
				if (user !== undefined) {
					// if user doesn't exist then it update status to offline
					const userRef = firebase.database().ref("roomusers/" + user.key);
					userRef.update({ status: "offline" });
				}
			});
		history.goBack(); // redirecting to one privious page that is room list page
	};
	return (
		<div className="Container">
			<Container>
				<Row>
					<Col xs="3">
						<div>
							<Card className="UsersCard">
								<CardBody>
									<CardSubtitle>
										<Button
											variant="primary"
											type="button"
											onClick={() => {
												exitChat();
											}}
										>
											Exit Chat
										</Button>
									</CardSubtitle>
								</CardBody>
							</Card>
							{users.map((item, idx) => (
								<Card key={idx} className="UsersCard">
									<CardBody>
										<CardSubtitle>{item.nickname}</CardSubtitle>
									</CardBody>
								</Card>
							))}
						</div>
					</Col>
					<Col xs="9">
						<ScrollToBottom className="ChatContent">
							{chats.map((item, idx) => (
								<div key={idx} className="MessageBox">
									{item.type === "join" || item.type === "exit" ? (
										<div className="ChatStatus">
											<span className="ChatDate">{item.date}</span>
											<span className="ChatContentCenter">{item.message}</span>
										</div>
									) : (
										<div className="ChatMessage">
											<div
												className={`${
													item.nickname === nickname
														? "RightBubble"
														: "LeftBubble"
												}`}
											>
												{item.nickname === nickname ? (
													<span className="MsgName">Me</span>
												) : (
													<span className="MsgName">{item.nickname}</span>
												)}
												<span className="MsgDate"> at {item.date}</span>
												<p>{item.message}</p>
											</div>
										</div>
									)}
								</div>
							))}
						</ScrollToBottom>
						<footer className="StickyFooter">
							<Form className="MessageForm" onSubmit={submitMessage}>
								<InputGroup>
									<Input
										type="text"
										name="message"
										id="message"
										placeholder="Enter message here"
										value={newchat.message}
										onChange={onChange}
									/>
									<InputGroupAddon addonType="append">
										<Button
											variant="primary"
											type="submit"
											className="send-btn"
										>
											Send
										</Button>
									</InputGroupAddon>
								</InputGroup>
							</Form>
						</footer>
					</Col>
				</Row>
			</Container>
		</div>
	);
}

export default ChatRoom;

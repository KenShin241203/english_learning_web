import { createContext, useState } from "react";

export const AuthContext = createContext({
    "_id": "",
    "name": "",
    "email": "",
    "password": "",
    "phone": "",
    "avatar": "",
    "role": "",
    "courseInfo": [],
    "reviewInfo": [],
});

export const AuthWrapper = (props) => {
    const [user, setUser] = useState({
        "_id": "",
        "name": "",
        "email": "",
        "password": "",
        "phone": "",
        "avatar": "",
        "role": "",
        "courseInfo": [],
        "reviewInfo": [],
    })
    const [isAppLoading, setIsAppLoading] = useState(true);
    return (
        <AuthContext.Provider value={{ user, setUser, isAppLoading, setIsAppLoading }}>
            {props.children}
        </AuthContext.Provider>
    )
}

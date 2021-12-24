import { atom } from "recoil";

export const userState = atom({
    key: "example",
    default: {
        id: 123,
        name: "John Doe",
        email: "test@gmail.com",
    },
});
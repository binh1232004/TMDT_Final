"use client";

import { useEffect, useState } from "react";
import { deleteUser, getUsers } from "@/lib/firebase";
import { ExclamationCircleFilled } from "@ant-design/icons";
import { List, Modal, Spin, Typography } from "antd";
import UserListItem from "@/app/user/admin/UserListItem";
import UserForm from "@/app/user/admin/UserForm";
import { useMessage } from "@/lib/utils";

const { confirm } = Modal;
const { Title } = Typography;

export default function UserList() {
    const { error, contextHolder } = useMessage();
    const [users, setUsers] = useState({});
    const [currentUser, setCurrentUser] = useState({});
    const [reload, setReload] = useState(false);
    const [userModal, setUserModal] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getUsers().then((data) => {
            if (data.status === "success") {
                setUsers(data.data);
                setLoading(false);
            } else {
                error(data.message);
            }
        });
    }, [reload]);

    const onDelete = (user) => {
        confirm({
            title: "Do you want to delete this user?",
            icon: <ExclamationCircleFilled/>,
            content: "This action cannot be undone",
            okType: "danger",
            maskClosable: true,
            onOk() {
                return deleteUser(user.uid).then((result) => {
                    if (result.status === "success") {
                        setReload(!reload);
                    }
                });
            },
            onCancel() {
            },
        });
    };

    const onEdit = (user) => {
        setUserModal(true);
        setCurrentUser(user);
    };

    return <div>
        <Spin spinning={loading} size="large">
            {contextHolder}
            <Title level={3}>Edit users</Title>
            <UserForm user={currentUser} open={userModal} onClose={() => setUserModal(false)}
                      onComplete={() => setReload(!reload)}></UserForm>
            <List
                size="small"
                bordered
                dataSource={Object.keys(users).map((key) => {
                    return { uid: key, ...users[key] };
                })}
                pagination={{ position: "bottom", align: "center" }}
                renderItem={(item) => {
                    return <UserListItem user={item} onDelete={onDelete} onEdit={onEdit}></UserListItem>;
                }}
            />
        </Spin>
    </div>;
}
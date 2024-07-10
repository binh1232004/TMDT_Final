"use client";

import { Button, List, Typography } from "antd";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";

const { Text, Link } = Typography;

export default function UserListItem({ user, onEdit = null, onDelete = null }) {

    return <List.Item>
        <div className="flex flex-row justify-between w-full">
            <div className="flex flex-row gap-2">
                <div className="flex flex-col">
                    {user.deleted ? <Text type="danger" delete>{user?.info?.name}</Text> : <p>{user?.info?.name}</p>}
                    {user.deleted ? <Text type="danger" delete>{user?.info?.email}</Text> : <p>{user?.info?.email}</p>}
                </div>
            </div>
            <div className="flex flex-row gap-2 h-fit my-auto">
                {user.deleted ? <Button size="small" type="primary" danger onClick={() => {

                }}>Delete data</Button> : null}
                <Button size="small" disabled={user.deleted} type="default" onClick={() => {
                    if (onEdit) {
                        onEdit(user);
                    }
                }}><EditOutlined/></Button>
                <Button size="small" type="primary" danger disabled={user.deleted} onClick={() => {
                    if (onDelete) {
                        onDelete(user);
                    }
                }}><DeleteOutlined/></Button>
            </div>
        </div>
    </List.Item>;
}
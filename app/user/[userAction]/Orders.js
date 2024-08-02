"use client";

import { Card, Collapse, Divider, List, Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import { getOrders } from "@/lib/firebase";
import { numberWithSeps } from "@/lib/utils";
import Cart from "@/app/user/[userAction]/Cart";

const { Title } = Typography;

const orderListItem = (order) => {
    return <Card key={order.id} className="!my-2">
        <div className="flex flex-col justify-between w-full">
            <div>
                <div className="flex flex-row justify-between">
                    <Title level={5}>{order.date}</Title>
                    <p>{order.status ? "Complete" : "Ongoing"}</p>
                </div>
                <hr className="my-2"/>
            </div>
            <div>
                <Collapse items={[{
                    key: "1",
                    label: "Items",
                    children: <Cart c={order?.cart || order?.products} small/>,
                }]}/>
            </div>
            <div className="flex flex-row justify-end w-full">
                <div>
                    <p>{order.deliveryOption}</p>
                    <p>Total: ${numberWithSeps(order.total)}</p>
                </div>
            </div>
        </div>
    </Card>;
};


export default function Orders() {
    const [orders, setOrders] = useState({});
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        getOrders().then((orders) => {
            if (orders.status === "success") {
                setOrders(Object.keys(orders.data).map((key) => {
                    return {
                        ...orders.data[key],
                        id: key,
                        date: new Date(parseInt(key.slice(0, 13))).toLocaleString("en-GB", { timeZone: "UTC" }),
                    };
                }));
                setLoaded(true);
            }
        });
    }, []);

    return <Spin spinning={!loaded}>
        <Divider orientation="left" className="!my-0" orientationMargin="0">
            <Title level={3}>Your orders</Title>
        </Divider>
        <List
            dataSource={Object.values(orders)}
            renderItem={orderListItem}
        />
    </Spin>;
};
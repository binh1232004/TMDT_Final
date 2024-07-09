"use client";

import { useUser } from "@/lib/firebase";
import { useEffect, useLayoutEffect, useState } from "react";
import { Button, Layout, List, Menu, Modal, Spin } from "antd";
import { useRouter } from "next/navigation";
import { ProductOutlined, UserOutlined, PlusCircleOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { getCatalogs, getProducts } from "@/lib/firebase_server";
import ProductListItem from "@/app/user/admin/ProductListItem";
import ProductForm from "@/app/user/admin/ProductForm";

const { confirm } = Modal;

export default function AdminPage() {
    const user = useUser();
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [catalogs, setCatalogs] = useState([]);
    const [currentAction, setCurrentAction] = useState("products");
    const [currentProductCatalog, setCurrentProductCatalog] = useState();
    const [productModal, setProductModal] = useState(false);
    const [currentProduct, setCurrentProduct] = useState({});

    const items = [
        {
            label: "Products",
            key: "products",
            icon: <ProductOutlined/>,
        },
        {
            label: "Users",
            key: "users",
            icon: <UserOutlined/>,
        },
    ];

    useLayoutEffect(() => {
        if (user !== undefined) {
            if (!user?.admin) {
                router.push("/");
            }
        }
    }, [user, router]);

    useEffect(() => {
        if (currentAction === "products") {
            getCatalogs().then((data) => {
                setCatalogs(Object.keys(data).map((key) => {
                    return {
                        label: data[key].name,
                        key: key,
                        icon: <ProductOutlined/>,
                    };
                }));
                if (!currentProductCatalog) setCurrentProductCatalog(Object.keys(data)[0]);
            });
        }
    }, [currentAction]);

    useEffect(() => {
        if (currentProductCatalog) {
            getProducts(currentProductCatalog, -1).then((data) => {
                setProducts(data);
                console.log("getProducts", currentProductCatalog, data);
            });
        }
    }, [currentProductCatalog]);

    const confirmDelete = () => {
        confirm({
            title: "Do you want to delete this items?",
            icon: <ExclamationCircleFilled/>,
            content: "When clicked the OK button, this dialog will be closed after 1 second",
            okType: "danger",
            maskClosable: true,
            onOk() {
                return new Promise((resolve, reject) => {
                    setTimeout(Math.random() > 0.5 ? resolve : reject, 1000);
                }).catch(() => console.log("Oops errors!"));
            },
            onCancel() {
            },
        });
    };

    const onClick = ({ key }) => {
        setCurrentAction(key);
    };

    const onClick2 = ({ key }) => {
        setCurrentProductCatalog(key);
    };

    const onEdit = (product) => {
        setProductModal(true);
        setCurrentProduct(product);
    };

    const onDelete = (product) => {
        confirmDelete();
    };

    const onAdd = () => {
        setProductModal(true);
        setCurrentProduct({});
    };

    if (user) {
        return <div className="py-12 px-20">
            <ProductForm product={currentProduct} open={productModal}
                         onClose={() => setProductModal(false)}></ProductForm>
            <Layout className="overflow-hidden">
                <h1 className="w-full text-center text-2xl font-bold my-2">Admin console</h1>
                <div className="flex flex-row bg-white p-3 rounded-lg">
                    <Menu
                        onClick={onClick}
                        selectedKeys={[currentAction]}
                        mode="vertical"
                        items={items}
                        className="!bg-transparent max-w-[200px] min-w-[160px]"
                    />
                    <div className="m-3 w-full">
                        {currentAction === "products" && <div>
                            <Menu onClick={onClick2} selectedKeys={[currentProductCatalog]} mode="horizontal"
                                  items={catalogs}/>
                            <List
                                size="small"
                                bordered
                                footer={
                                    <div>
                                        <Button type="primary" size="small"
                                                onClick={onAdd}><PlusCircleOutlined/>Add</Button>
                                    </div>
                                }
                                dataSource={Object.keys(products).map((key) => products[key])}
                                pagination={{ position: "bottom", align: "center" }}
                                renderItem={(item) => {
                                    return <ProductListItem product={item} onEdit={onEdit}
                                                            onDelete={onDelete}></ProductListItem>;
                                }}
                            />
                        </div>}
                        {currentAction === "users" && <div>
                            Users
                        </div>}
                    </div>
                </div>
            </Layout>
        </div>;
    } else {
        return <div className="w-full h-full flex justify-center p-12"><Spin size="large"/></div>;
    }
}
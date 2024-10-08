"use client";


import { useEffect, useState } from "react";
import { getCatalogs, getProduct } from "@/lib/firebase_server";
import { Button, Carousel, Descriptions, Image, InputNumber, Radio, Tooltip, Typography } from "antd";
import { getPendingOrder, setCart, setPendingOrder, useCart, useUser } from "@/lib/firebase";
import { numberWithSeps, useMessage } from "@/lib/utils";
import {
    CreditCardOutlined,
    FacebookOutlined,
    LinkOutlined,
    PinterestOutlined,
    RedditOutlined,
    ShoppingCartOutlined,
    XOutlined
} from "@ant-design/icons";
import ItemList from "@/app/ItemList";

const { Title, Text } = Typography;

const options = [
    { label: "S", value: "s" },
    { label: "M", value: "m" },
    { label: "L", value: "l" },
    { label: "XL", value: "xl" },
];

export default function Product({ params }) {
    const { error, success, contextHolder } = useMessage();
    const catalog = params["catalog"];
    const user = useUser();
    const cart = useCart();
    const [id] = params["id-name"].split("-", 2);
    const [product, setProduct] = useState({});
    const [option, setOption] = useState("s");
    const [amount, setAmount] = useState(1);

    useEffect(() => {
        getCatalogs().then(c => {
            if (c?.[catalog]) c = c[catalog];
            getProduct(id, c.name || catalog).then(result => {
                setProduct(result);
                window.history.replaceState(window.history.state, "", `/${(c.name || catalog).toLowerCase()}/${id}-${result.name.replaceAll(" ", "-").replaceAll(/[^a-zA-Z0-9-_]/g, "")}`);
            });
        });
    }, [catalog, id]);

    const onChange = ({ target: { value } }) => {
        setOption(value);
    };

    return Object.keys(product).length ? (
        <div>
            <div className="bg-white m-8 mx-12 rounded-lg flex flex-row">
                {contextHolder}
                <div className="p-3 w-[38%]">
                    <Carousel autoplay arrows className="!overflow-hidden !rounded-lg">
                        {product.images.map((image, i) => {
                            return <div key={i}>
                                <Image alt={product.name} className="rounded-lg" src={image} preview={{
                                    mask: "",
                                    maskClassName: "rounded-lg !bg-transparent"
                                }}></Image>
                            </div>;
                        })}
                    </Carousel>
                </div>
                <div className="px-8 py-2 my-6 w-full">
                    <Title>{product.name}</Title>
                    <Title level={2} className="!my-1">${numberWithSeps(product.price)}</Title>
                    <div className="flex flex-row gap-2 my-2">
                        <p className="h-fit my-auto">Size: </p>
                        <Radio.Group buttonStyle="solid" options={options.map(({ label, value }) => {
                            return ({ label, value, disabled: product.variants[value] === 0 });
                        })} onChange={onChange} value={option} optionType="button"/>
                    </div>
                    <div className="flex flex-row gap-2">
                        <p className="h-fit my-auto">Amount: </p>
                        <InputNumber className="!my-3" min={1} max={product.variants[option]}
                                     defaultValue={amount} onChange={setAmount}></InputNumber>
                        <p className="h-fit my-auto">{product.variants[option]} left</p>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="grid grid-cols-2 gap-3 my-3 w-full col-span-2">
                            <Button disabled={product.variants[option] === 0 || !(product.variants[option] >= amount)}
                                    size="large" type="primary"
                                    onClick={() => {
                                        if (getPendingOrder(user).length) {
                                            error("You have a pending order. Please complete the payment first.");
                                        } else {
                                            setPendingOrder(user, [{
                                                id: product.id,
                                                catalog: product.catalog,
                                                variant: option,
                                                amount: amount,
                                            }]).then(result => {
                                                if (result.status === "success") {
                                                    window.location.href = "/user/payment";
                                                } else {
                                                    error("An error occurred " + result.message);
                                                }
                                            });
                                        }
                                    }}
                            >
                                <CreditCardOutlined/> Buy now
                            </Button>
                            <Button disabled={product.variants[option] === 0 || !(product.variants[option] >= amount)}
                                    size="large" ghost type="primary" onClick={() => {
                                if (cart.some(item => item.id === product.id)) {
                                    error("Item already in cart");
                                    return;
                                }
                                setCart(user, [
                                    ...cart,
                                    {
                                        id: product.id,
                                        catalog: product.catalog,
                                        variant: option,
                                        amount: amount,
                                    }
                                ]).then(result => {
                                    if (result.status === "success") {
                                        success("Added to cart");
                                    } else {
                                        error("An error occurred " + result.message);
                                    }
                                });
                            }}>
                                <ShoppingCartOutlined/> Add to cart
                            </Button>
                        </div>
                        <div className="flex flex-col justify-center">
                            <div className="flex flex-row gap-1">
                                <div className="flex flex-col justify-center">
                                    Share:
                                </div>
                                <Tooltip title="Copy link">
                                    <Button type="text" icon={<LinkOutlined style={{ fontSize: "1.4rem" }}/>}
                                            onClick={() => {
                                                navigator.clipboard.writeText(window.location.href).then(() => {
                                                    success("Link copied");
                                                });
                                            }}></Button>
                                </Tooltip>
                                <Tooltip title="Share on Facebook">
                                    <Button type="text" icon={<FacebookOutlined style={{ fontSize: "1.4rem" }}/>}
                                            onClick={() => {
                                                window.open(`https://www.facebook.com/sharer/sharer.php?u=${window.location.href}&t=${product.name}`, "popup", "width=600,height=600");
                                            }}></Button>
                                </Tooltip>
                                <Tooltip title="Share on X">
                                    <Button type="text" icon={<XOutlined style={{ fontSize: "1.4rem" }}/>}
                                            onClick={() => {
                                                window.open(`https://twitter.com/intent/tweet?url=${window.location.href}`, "popup", "width=600,height=600");
                                            }}></Button>
                                </Tooltip>
                                <Tooltip title="Share on Pinterest">
                                    <Button type="text" icon={<PinterestOutlined style={{ fontSize: "1.4rem" }}/>}
                                            onClick={() => {
                                                window.open(`https://pinterest.com/pin/create/button/?url=${window.location.href}&media=${product.images[0]}&description=${product.name}`, "popup", "width=600,height=600");
                                            }}></Button>
                                </Tooltip>
                                <Tooltip title="Share on Reddit">
                                    <Button type="text" icon={<RedditOutlined style={{ fontSize: "1.4rem" }}/>}
                                            onClick={() => {
                                                window.open(`https://reddit.com/submit?url=${window.location.href}&title=${product.name}`, "popup", "width=600,height=600");
                                            }}></Button>
                                </Tooltip>
                            </div>

                        </div>
                    </div>
                    <Descriptions title="Product details" column={1} className="!my-2">
                        <Text className="whitespace-break-spaces">{product.description}</Text>
                    </Descriptions>
                </div>
            </div>
            <div>
                <ItemList catalog={catalog} title={"Related products"} extra={`/${catalog}`} ribbon={false}></ItemList>
            </div>
        </div>
    ) : null;
}
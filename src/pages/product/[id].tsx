import Image from "next/image";
import Stripe from "stripe";
import { stripe } from "../../lib/stripe";
import {ImageContainer, ProductContainer, ProductDetails} from "@/src/styles/pages/product";
import {GetStaticPaths, GetStaticProps} from "next";
import axios from "axios";
import {useState} from "react";
//import {useRouter} from "next/router";


interface ProductProps {
    product: {
        id: string
        name: string
        imageUrl: string
        price: string
        description: string
        defaultPriceID: string
    }
}

export default function Product({ product }: ProductProps) {
    // Para rota interna do projeto
    //const router = useRouter();

    const [isCreatingCheckoutSession, setIsCreatingCheckoutSession] = useState(false);
    
    async function handleBuyProduct() {
        try {
            setIsCreatingCheckoutSession(true);

            const response = await axios.post('/api/hello', {
                priceId: product.defaultPriceID,
            })

            const { checkoutUrl } = response.data;

            // Para rota interna do projeto
           // router.push('/checkout')

            window.location.href = checkoutUrl

        } catch (e) {
            //conectar com ferramenta observalibilidade (Datadog / sentry)

            setIsCreatingCheckoutSession(false);

            alert('Falha ao redirecionar ao checkout')
        }
    }

    return (
        <ProductContainer>
            <ImageContainer>
                <Image src={product.imageUrl} width={520} height={480} alt=""/>

            </ImageContainer>

            <ProductDetails>
                <h1>{product.name}</h1>
                <span>{product.price}</span>

                <p>{product.description} </p>
                <button onClick={handleBuyProduct} disabled={isCreatingCheckoutSession}>comprar agora</button>
            </ProductDetails>
        </ProductContainer>
    )
}

export const getStaticPaths: GetStaticPaths = async () => {
    return {
        paths: [
            {
                params: { id: '' }
            }
        ],
        fallback: 'blocking',
    }
}
    export const getStaticProps: GetStaticProps<any, { id: string }> = async ({ params }) => {
        // @ts-ignore
        const productId = params.id;

        const product = await stripe.products.retrieve(productId, {
            expand: ['default_price']
        });
        const price = product.default_price as Stripe.Price;

        return {
            props: {
                product: {
                    id: product.id,
                    name: product.name,
                    imageUrl: product.images[0],

                    price: new Intl.NumberFormat('pt-BR', {

                        style: 'currency',
                        currency: 'BRL'
                    }).format(price.unit_amount! / 100),
                    description: product.description,
                    defaultPriceId: price.id
                }
            },
            revalidate: 60 * 60
        }
    }
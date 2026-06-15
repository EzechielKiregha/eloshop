import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface OrderItem {
  name: string;
  quantity: number;
  price: string;
}

interface OrderConfirmationEmailProps {
  customerName: string;
  orderNumber: string;
  total: string;
  items: OrderItem[];
}

export const OrderConfirmationEmail = ({
  customerName,
  orderNumber,
  total,
  items,
}: OrderConfirmationEmailProps) => (
  <Html>
    <Head />
    <Preview>
      Commande {orderNumber} confirmee - KAMEGA Shop
    </Preview>
    <Body
      style={{
        fontFamily: "Arial, Helvetica, sans-serif",
        backgroundColor: "#f4f4f5",
        padding: "24px 0",
        margin: 0,
      }}
    >
      <Container
        style={{
          maxWidth: "600px",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid #e4e4e7",
        }}
      >
        {/* Header */}
        <Section
          style={{
            backgroundColor: "#18181b",
            padding: "28px 32px",
            color: "#ffffff",
            textAlign: "center" as const,
          }}
        >
          <Text
            style={{
              fontSize: "24px",
              fontWeight: "700",
              margin: "0 0 4px",
              letterSpacing: "-0.5px",
            }}
          >
            KAMEGA Shop
          </Text>
          <Text style={{ fontSize: "13px", margin: 0, opacity: 0.7 }}>
            Confirmation de commande
          </Text>
        </Section>

        {/* Body */}
        <Section style={{ padding: "28px 32px" }}>
          <Heading
            style={{
              fontSize: "20px",
              fontWeight: "600",
              color: "#18181b",
              margin: "0 0 16px",
            }}
          >
            Merci pour votre commande, {customerName} !
          </Heading>

          <Text
            style={{
              fontSize: "15px",
              color: "#3f3f46",
              lineHeight: "1.6",
              margin: "0 0 8px",
            }}
          >
            Votre commande <strong>{orderNumber}</strong> a bien ete enregistree.
          </Text>

          {/* Order summary */}
          <Section
            style={{
              backgroundColor: "#fafafa",
              border: "1px solid #e4e4e7",
              borderRadius: "8px",
              padding: "16px",
              margin: "16px 0",
            }}
          >
            <Text
              style={{
                fontSize: "13px",
                fontWeight: "600",
                color: "#71717a",
                textTransform: "uppercase" as const,
                letterSpacing: "1px",
                margin: "0 0 12px",
              }}
            >
              Resume de la commande
            </Text>

            {items.map((item, i) => (
              <Text
                key={i}
                style={{
                  fontSize: "14px",
                  color: "#3f3f46",
                  margin: "0 0 6px",
                  display: "flex" as const,
                  justifyContent: "space-between" as const,
                }}
              >
                {item.name} x{item.quantity} — {item.price}
              </Text>
            ))}

            <Hr style={{ borderColor: "#e4e4e7", margin: "12px 0" }} />

            <Text
              style={{
                fontSize: "16px",
                fontWeight: "700",
                color: "#18181b",
                margin: 0,
                textAlign: "right" as const,
              }}
            >
              Total : {total}
            </Text>
          </Section>

          <Text
            style={{
              fontSize: "14px",
              color: "#71717a",
              lineHeight: "1.6",
              margin: "16px 0 0",
            }}
          >
            Vous pouvez suivre votre commande depuis votre espace client.
          </Text>
        </Section>

        <Hr style={{ borderColor: "#e4e4e7", margin: 0 }} />

        {/* Footer */}
        <Section
          style={{
            padding: "18px 32px",
            color: "#a1a1aa",
            fontSize: "13px",
            lineHeight: "1.5",
          }}
        >
          <Text style={{ margin: 0 }}>
            Merci de faire confiance a KAMEGA Shop.
          </Text>
          <Text style={{ margin: "8px 0 0" }}>
            Cet email a ete envoye automatiquement. Merci de ne pas y repondre.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

export default OrderConfirmationEmail;

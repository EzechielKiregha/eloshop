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

interface WelcomeEmailProps {
  userName: string;
}

export const WelcomeEmail = ({ userName }: WelcomeEmailProps) => (
  <Html>
    <Head />
    <Preview>Bienvenue chez KAMEGA Shop - Votre compte a ete cree</Preview>
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
            Votre boutique en ligne
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
            Bienvenue, {userName} !
          </Heading>

          <Text
            style={{
              fontSize: "15px",
              color: "#3f3f46",
              lineHeight: "1.6",
              margin: "0 0 16px",
            }}
          >
            Votre compte KAMEGA Shop a bien ete cree. Vous pouvez maintenant :
          </Text>

          <Text
            style={{
              fontSize: "14px",
              color: "#3f3f46",
              lineHeight: "1.8",
              margin: "0 0 8px",
              paddingLeft: "16px",
            }}
          >
            &#8226; Parcourir notre catalogue de vetements et chaussures
            <br />
            &#8226; Passer des commandes en ligne
            <br />
            &#8226; Suivre vos commandes depuis votre espace client
            <br />
            &#8226; Telecharger vos recus
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

export default WelcomeEmail;

import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

Font.register({ family: 'Calibri Light', src: `${process.env.PUBLIC_URL}/calibril.ttf` });
Font.register({ family: 'Calibri Bold', src: `${process.env.PUBLIC_URL}/calibrib.ttf` });

const zeroPad = (num, places) => String(num).padStart(places, '0');

const formatoDinero = num => new Intl.NumberFormat("es-SV", {style: "currency", currency: "USD"}).format(num);

const styles = StyleSheet.create({
    body: {
        paddingTop: 5,
        paddingBottom: 65,
        paddingHorizontal: 25,
        fontFamily: 'Calibri Light'
    },
    header: {
        marginBottom: 20,
        display: 'flex',
        flexDirection: 'row',
    },
    headerImage: {
        width: 90,
        height: 40,
        opacity: '0.6',
    },
    headerText: {
        fontSize: 8,
        marginLeft: 'auto',
        paddingVertical: 15,
        marginRight: 0,
        opacity: '0.6',
    },
    title: {
        marginVertical: 8,
        fontSize: 12,
        fontFamily: 'Calibri Bold',
        textAlign: 'center',
        textDecoration: 'underline'
    },
    textContainer: {
        marginTop: 15,
        marginHorizontal: 55,
        flexWrap: 'wrap',
        flexDirection: 'row',
    },
    text: {
        fontSize: 11,
        textAlign: 'justify',
    },
    textValue: {
        fontFamily: 'Calibri Bold',
        textDecoration: 'underline',
    },
    subtitle: {
        width: '100%',
        fontSize: 11,
        marginVertical: 14,
        fontFamily: 'Calibri Bold',
        textDecoration: 'underline',
    },
    listContainer: {
        marginVertical: 8,
        marginLeft: 20,
        flexDirection: 'row'
    },
    sublistContainer: {
        marginVertical: 6,
        marginLeft: 40,
        flexDirection: 'row'
    },
    itemDecoration: {
        fontSize: 12,
        width: 18,
        fontFamily: 'Calibri Bold'
    },
    listItem: {
        width: '100%',
        fontSize: 11,
        fontFamily: 'Calibri Bold',
    },
    sublistItem: {
        fontSize: 11,
    }
});

const Contrato = props => {
    let { contrato } = props;

    return (
        <Document>
            <Page size="LETTER" style={styles.body} wrap>
                <View style={styles.header} fixed>
                    <Image
                        src={process.env.PUBLIC_URL + '/turbo-mega-reporte.png'}
                        style={styles.headerImage}
                    />
                    <Text style={styles.headerText}>
                        Contrato de Servicios de Internet Inalámbrico
                    </Text>
                </View>
                <Text style={styles.title}>
                    CONTRATO DE PRESTACIÓN DE SERVICIOS DE INTERNET INALÁMBRICO
                </Text>
                <View style={styles.textContainer}>
                    <Text style={styles.text}>
                        Se hace constar por el presente Contrato,
                        la prestación de servicios de conexión a internet
                        via inalámbrica que suscriben por una parte a:&nbsp;
                        <Text style={styles.textValue}>Fredy Ernesto Díaz Constanza</Text>
                        , identificado con DUI: N°&nbsp;
                        <Text style={styles.textValue}>03628626-0</Text>
                        , y N° DE REGISTRO TRIBUTARIO:&nbsp;
                        <Text style={styles.textValue}>0821-261086-101-2</Text>
                        , inscrito en el Registro de Contribuyentes, con domicilio en&nbsp;
                        <Text style={styles.textValue}>Av. Juan Manuel Rodriguez, Barrio el Centro #156, Zacatecoluca, La Paz.</Text>
                        , a quien en adelante se llamará&nbsp;
                        <Text style={styles.textValue}>EL PROVEEDOR</Text>
                        , por la otra parte,&nbsp;
                        <Text style={styles.textValue}>Sandra Gloria Carabantes de Montano</Text>
                        con N° de DUI:&nbsp;
                        <Text style={styles.textValue}>02455908-9</Text>
                        , y con número de identificación tributaria (NIT):&nbsp;
                        <Text style={styles.textValue}>0821-020577-109-7</Text>
                        , con domicilio en&nbsp;
                        <Text style={styles.textValue}>Lot. El gran Chaparral, CL. Km 69, Zacatecoluca, La Paz.</Text>
                        , a quien en adelante se llamará&nbsp;
                        <Text style={styles.textValue}>EL CLIENTE</Text>
                        en los términos y condiciones siguientes:
                    </Text>
                    <Text style={styles.subtitle}>
                        PRIMERO
                    </Text>
                    <View style={styles.listContainer}>
                        <Text style={styles.itemDecoration}>
                            »
                        </Text>
                        <Text style={styles.listItem}>
                            PARTES INVOLUCRADAS
                        </Text>
                    </View>
                    <View style={styles.sublistContainer}>
                        <Text style={styles.itemDecoration}>
                            •
                        </Text>
                        <Text style={styles.sublistItem}>
                            EL PROVEEDOR, es un comerciante especializado en brindar servicios de <Text style={{ textDecoration: 'underline' }}>INTERNET INALAMBRICO</Text>
                        </Text>
                    </View>
                    <View style={styles.sublistContainer}>
                        <Text style={styles.itemDecoration}>
                            •
                        </Text>
                        <Text style={styles.sublistItem}>
                            EL CLIENTE es un consumidor cuyo objeto es el uso personal del servicio
                        </Text>
                    </View>
                    <Text style={styles.subtitle}>
                        SEGUNDO
                    </Text>
                    <View style={styles.listContainer}>
                        <Text style={styles.itemDecoration}>
                            »
                        </Text>
                        <Text style={styles.listItem}>
                            TIPO DE SERVICIO
                        </Text>
                    </View>
                    <Text style={styles.text}>
                        El objeto del presente contrato es pactar entre el&nbsp;
                        <Text style={{ fontFamily: 'Calibri Bold' }}>EL PROVEEDOR</Text>
                        &nbsp;y&nbsp;
                        <Text style={{ fontFamily: 'Calibri Bold' }}>EL CLIENTE</Text>
                        la contratación del servicio remunerado específico siguiente:
                    </Text>
                    <View style={styles.sublistContainer}>
                        <Text style={styles.itemDecoration}>
                            •
                        </Text>
                        <Text style={styles.sublistItem}>
                        	Servicios de conexión de internet a traves de red inalambrica, utilizando equipo de última tecnología.
                        </Text>
                    </View>
                    <Text style={styles.subtitle}>
                        TERCERO
                    </Text>
                    <View style={styles.listContainer}>
                        <Text style={styles.itemDecoration}>
                            »
                        </Text>
                        <Text style={styles.listItem}>
                        	VIGENCIA Y TIPO DE PRESTACIÓN
                        </Text>
                    </View>
                    <Text style={styles.text}>
                        El presente contrato tendrá vigencia desde&nbsp;
                        <Text style={styles.textValue}>Diciembre de 2020</Text>
                        &nbsp;hasta&nbsp;
                        <Text style={styles.textValue}>Mayo de 2022</Text>
                        , brindando el proveedor una velocidad de conexión inalámbrica de&nbsp;
                        <Text style={styles.textValue}>
                            Tres Megabytes (3) Mbps.
                        </Text>
                    </Text>
                    <Text style={styles.subtitle}>
                        CUARTO
                    </Text>
                    <View style={styles.listContainer}>
                        <Text style={styles.itemDecoration}>
                            »
                        </Text>
                        <Text style={styles.listItem}>
                        	CUOTAS
                        </Text>
                    </View>
                    <Text style={styles.text}>
                        La prestación pactada de común acuerdo que&nbsp;
                        <Text style={{ fontFamily: 'Calibri Bold' }}>EL CLIENTE</Text>
                        se compromete a pagar durante Diesiocho cuotas al&nbsp;
                        <Text style={{ fontFamily: 'Calibri Bold' }}>PROVEEDOR</Text>
                        , es de&nbsp;
                        <Text style={{ fontFamily: 'Calibri Bold' }}>Veintiséis 11/100 ($26.11)</Text>&nbsp;
                        en dólares americanos, en concepto de pago por los servicios de conexión a internet inalámbrico.
                    </Text>
                    <Text style={styles.subtitle}>
                        QUINTO
                    </Text>
                    <View style={styles.listContainer}>
                        <Text style={styles.itemDecoration}>
                            »
                        </Text>
                        <Text style={styles.listItem}>
                        	OBLIGACIONES
                        </Text>
                    </View>
                    <Text style={styles.text}>
                        Sin perjuicio de otras obligaciones expresamente estipuladas y/o derivadas del presente contrato, las partes tienen las siguientes obligaciones principales:
                    </Text>


                    <View style={styles.sublistContainer}>
                        <Text style={styles.itemDecoration}>
                            •
                        </Text>
                        <Text style={styles.listItem}>
                            PROVEEDOR:
                        </Text>
                    </View>
                    <View style={styles.sublistContainer}>
                        <Text style={styles.itemDecoration}>
                            •
                        </Text>
                        <Text style={styles.listItem}>
                            CLIENTE:
                        </Text>
                    </View>


                    <Text style={styles.subtitle}>
                        SEXTO
                    </Text>


                    <Text style={styles.subtitle}>
                        SÉPTIMO
                    </Text>
                    <Text style={styles.subtitle}>
                        OPTAVO
                    </Text>
                </View>
            </Page>
        </Document>
    );
}

export default Contrato;

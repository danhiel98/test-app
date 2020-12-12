import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';

Font.register({ family: 'Courier New', src: `${process.env.PUBLIC_URL}/cour.ttf` });

const zeroPad = (num, places) => String(num).padStart(places, '0');

const formatoDinero = num => new Intl.NumberFormat("es-SV", {style: "currency", currency: "USD"}).format(num);

const styles = StyleSheet.create({
    mainContainer: {
        width: 380,
        margin: 8,
        border: 1,
        borderColor: 'red'
    },
    dateContanier: {
        marginTop: 135,
        marginLeft: 295,
    },
    date: {
        fontFamily: 'Courier New',
        fontSize: 11
    }
});

const Factura = props => {

    return (
        <Document>
            <Page size={[397, 595.2]} style={{ flexDirection: 'row' }}>
                <View style={styles.mainContainer}>
                    <View style={styles.dateContanier}>
                        <Text style={styles.date}>06/03/2020</Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
}

export default Factura;

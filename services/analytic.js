//require('dotenv').config();
const { BetaAnalyticsDataClient } = require('@google-analytics/data');

const propertyId = 476854907;
const client = new BetaAnalyticsDataClient({
    keyFilename: 'config/intimalive-b83203b7a9e5.json'
});




/**
 * Получить все события за время
 * @param {'today'|'30daysAgo'|'7daysAgo'} startDate 
 * @returns {Promise<Record<string, number>>}
 */
async function getAnalyticsEvents(startDate) {
    const events = ['Выход', 'Авторизация', 'Регистрация', 'Переход к оплате', 'Супер поиск',
        'Платеж успешен', 'Платеж отмена', 'Сообшение', 'Супер лайк', 'Куплен подарок'
    ];

    const [response] = await client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: (startDate ?? '30daysAgo'), endDate: 'today' }],
        dimensions: [{ name: 'eventName' }],    // Название события
        metrics: [{ name: 'eventCount' }],      // Количество срабатываний
    });
    //console.log('Отчёт:', JSON.stringify(response.rows, null, 2));

    const result = {};
    response.rows?.map((elem)=> {
        const name = elem.dimensionValues[0].value;
        const value = elem.metricValues[0].value;

        if(events.includes(name)) {
            result[name] = +value;
        }
    });

    return result;
}

/**
 * Получает стату по новым пользователям либо не новым (type)
 * @param {'today'|'30daysAgo'|'7daysAgo'} startDate 
 * @param {'activeUsers' | 'newUsers'} type 
 * @returns {Promise<Array<{
 *         city: string
 *         country: string
 *         activeUsers?: number
 *         newUsers?: number
 *       }
 *   }>>}
 */
async function getAnalyticsByCountry(startDate, type) {
    const [response] = await client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: (startDate ?? '30daysAgo'), endDate: 'today' }],
        dimensions: [
            { name: 'country' },
            { name: 'city' },
        ],   
        metrics: [
            { name: type }
        ],
    });

    const result = [];
    response.rows?.forEach((row)=> {
        result.push({
            country: row.dimensionValues[0].value,
            city: row.dimensionValues[1].value,
            [type]: row.metricValues[0].value,
        });
    });

    //console.log(result)
    return result;
}

/**
 * Получить данные по источникам сессий пользователей
 * @param {'today'|'30daysAgo'|'7daysAgo'} startDate 
 * @param {'activeUsers' | 'newUsers'} type 
 * @returns {Promise<Array<{
 *         city: string
 *          country: string
 *          source: '(not set)' | '(direct)' | 'Google' | 'Facebook' | 'Instagram' | string
 *          type: '(not set)' | '(none)' | 'organic' | 'referral' | 'cpc' | 'social'
 *          referer: string                
 *          sessions: number
 *          duration: number
 *          activeUsers?: number
 *          newUsers?: number
 *       }
 *   }>>}
 */
async function getTrafficSources(startDate, type) {
    const [response] = await client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate: (startDate ?? '30daysAgo'), endDate: 'today' }],
        dimensions: [
            { name: 'city' },
            { name: 'country' },
            { name: 'sessionSource' },      // Источник (Google, Facebook, Instagram и т. д.)
            { name: 'sessionMedium' },      // Тип (organic, referral, cpc и т. д.)
            { name: 'pageReferrer'},
            //{ name: 'sessionCampaignName' },
        ],
        metrics: [
            { name: 'sessions' },
            { name: 'averageSessionDuration' },
            { name: type }
        ]
    });

    const result = [];
    response.rows?.forEach((row)=> {
        result.push({
            city: row.dimensionValues[0].value,
            country: row.dimensionValues[1].value,
            source: row.dimensionValues[2].value,                   // (direct), Google, Facebook, Instagram ...
            type: row.dimensionValues[3].value,                     // (none), organic, referral, cpc, social.
            referer: row.dimensionValues[4].value,                  // refer
            sessions: +row.metricValues[0].value,                   // Количество сеансов
            duration: Math.round(+row.metricValues[1].value),       // в секундах
            [type]: +row.metricValues[2].value                       // сколько посещений
        });
    });

    //console.log(result)
    return result;
}



module.exports = {
    getAnalyticsEvents,
    getAnalyticsByCountry,
    getTrafficSources
}
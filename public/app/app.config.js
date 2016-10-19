/**
 * Created by FG0003 on 07/10/2016.
 */
angular.module('orpha.config')
    .value('SESSION_TTL', 1000 * 60 * 10)
    .value('ALLOW_STORE_DATE', true)
    .value('OAUTH', {
        "client_id": "2",
        "client_secret": "FkHPWSOOI0OJqgCqTXbEHu9tOeifY0azVKatN8B0",
        "grant_type":"password"
    })
    .config(function ($mdThemingProvider, $mdDateLocaleProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('blue-grey', {
                'default': '600',
                'hue-1': '500',
                'hue-2': '600',
                'hue-3': '700'
            })
            .accentPalette('light-blue', {
                'default': '500'
            });

        $mdDateLocaleProvider.formatDate = function(date) {
            return moment(date).format('DD/MM/YYYY');
        };
        $mdDateLocaleProvider.parseDate = function(dateString) {
            var m = moment(dateString, 'YYYY-MM-DD HH:mm:ss', true);
            return m.isValid() ? m.toDate() : new Date(NaN);
        };

        $mdDateLocaleProvider.months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
        $mdDateLocaleProvider.shortMonths = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
        $mdDateLocaleProvider.days = ['Dom','Seg','Ter','Qua','Qui','Sex','Sab'];
        $mdDateLocaleProvider.shortDays = ['D','S','T','Q','Q','S','S'];
    });
"use strict";


define([
        'Events',
        'PipelineAPI',
        'ui/dom/DomElement'
    ],
    function(
        evt,
        PipelineAPI,
        DomElement
    ) {

        var dataTypeStyles = {
            number:"coloring_data_type_number",
            boolean:"coloring_data_type_bool_true",
            string:"coloring_data_type_string",
            false:"coloring_data_type_bool_false",
            array:"coloring_data_type_array",
            default:"coloring_data_type_default"
        };


        var DomDataField = function(domElem, fieldData) {
            this.category = fieldData.dataCategory;
            for (var i = 0; i < fieldData.dataKeys.length; i++) {
                this.addDataField(domElem, fieldData.dataKeys[i]);
            }
        };

        DomDataField.prototype.addDataField = function(domElem, fieldData) {

            var entryElem = new DomElement(domElem.element, 'entry_data_field');
            var keyElem = new DomElement(entryElem.element, 'data_field_key');
            var velueElem = new DomElement(entryElem.element, 'data_field_value');

            keyElem.setText(fieldData);

            var callback = function(src, data) {

                velueElem.setText(data);

                if (!data) {
                    velueElem.addStyleJsonId(dataTypeStyles.false);
                    return
                }

                if (dataTypeStyles[typeof(data)]) {
                    velueElem.addStyleJsonId(dataTypeStyles[typeof(data)])
                } else {
                    velueElem.addStyleJsonId(dataTypeStyles.default)
                }

            };

            PipelineAPI.subscribeToCategoryKey(this.category, fieldData, callback);

        };

        

        return DomDataField;

    });



/**
 * Theme: Minton Admin Template
 * Author: Coderthemes
 * Component: Editable
 *
 */
(function($) {

    var _fnCallbackFire = function(settings, callbackArr, eventName, args) {
        var ret = [];

        if (callbackArr) {
            ret = $.map(settings[callbackArr].slice().reverse(), function(val, i) {
                return val.fn.apply(settings.oInstance, args);
            });
        }

        if (eventName !== null) {
            var e = $.Event(eventName + '.dt');

            $(settings.nTable).trigger(e, args);

            ret.push(e.result);
        }

        return ret;
    };
    var _findObject = function(model, id) {
        var ret;
        let object = model.filter(index => index.get('id') === id);
        ret = (object.length > 0) ? object[0] : null;
        return ret;
    };
    var customPreDrawCallback = function (oSettings, controller) {
      var aiDisplay = oSettings.aiDisplay;
      $(".dataTables_empty").parent().remove();
      //Collapsing the expanded rows each time the table is rendered.
      $(".expanded").click();
      var modelName = controller.get('datatableModelName');
      var listModel = controller.get('listModel');
      if (aiDisplay.length !== 0) {
        //Checking if a datarow is being added or modified in the datatatable.
          if (!controller.get('AddEditMode')) {
            _fnCallbackFire(oSettings, 'aoDrawCallback', 'draw', [oSettings]);
            var model = controller.get(modelName),
              results = [],
              iDisplayStart = oSettings._iDisplayStart,
              iDisplayEnd = oSettings.fnDisplayEnd(),
              iStart = iDisplayStart,
              iEnd = iDisplayEnd;
            if (oSettings.oPreviousSearch.sSearch !== '') {
              controller.set('search', true);
            } else {
              controller.set('search', false);
            }
            for (var j = iStart; j < iEnd; j++) {
              var index = aiDisplay[j];
              var id = oSettings.aoData[index].nTr.id;
              var res = _findObject(model, id);
              results.push(res);
            }
            controller.set(listModel, results);
            return false;
          } else {
            return false;
          }
      } else {
        controller.set(listModel, []);
        return true;
      }
    };
    'use strict';

    var EditableTable = {

        options: {
            addButton: '#addToTable',
            table: '#datatable-editable',
            dialog: {
                wrapper: '#dialog',
                cancelButton: '#dialogCancel',
                confirmButton: '#dialogConfirm',
            }
        },

        initialize: function(controller, options) {
            this
                .setVars(options)
                .build(controller)
                .events();
        },
        setVars: function(options) {

            // this.$table				= $( this.options.table );
            // this.$addButton			= $( this.options.addButton );
            this.$table = $(options.table);
            this.$addButton = $(options.addButton);

            // dialog
            this.dialog = {};
            this.dialog.$wrapper = $(this.options.dialog.wrapper);
            this.dialog.$cancel = $(this.options.dialog.cancelButton);
            this.dialog.$confirm = $(this.options.dialog.confirmButton);

            return this;
        },

        build: function(controller) {
            var language = controller.get("language"),
                columns = controller.get("columns"),
                modelName = controller.get("modelName"),
                model = controller.get("model"),
                handleDrawCallback = (controller.get("handleDrawCallback")) ? true : false,
                serverSide = controller.get("serverSide") ? controller.get("serverSide") : true;
            var datatableObj = {
                "language": language,
            };
            if (handleDrawCallback) {
                datatableObj.fnPreDrawCallback = function (oSettings) {
                  var func = controller.get('handleDrawCallback');
                  if (typeof(func) === 'function') {
                    return func(oSettings, controller, _fnCallbackFire);
                  } else {
                    return customPreDrawCallback(oSettings, controller);
                  }
                };
                // datatableObj.fnPreDrawCallback = this.customPreDrawCallback;
            }

            if (serverSide === 1) {
                datatableObj.aoColumns = columns;
                datatableObj.bServerSide = serverSide;
                datatableObj.ajax = function(data, callback, settings) {
                    settings.sAjaxDataProp = modelName; //"staff";
                    data = JSON.stringify(data);
                    // CHECK IF A RECORD IS IN EDIT MODE
                    if (controller.get("id") || controller.get("newRow")) {
                        controller.send("cancel");
                    }
                    // IF SO THEN RESOLVE THAT
                    if (!controller.get("abortTransition")) {
                        controller.set("call", "started");
                        if (controller.get("data") !== data) {
                            controller.set("data", data);
                        } else {
                            controller.set("call", "ended");
                        }
                        var callsb = function(interval) {
                            interval = (interval) ? interval : 1;
                            if (controller.get("call") === "ended") {
                                var ajaxData = model.data;
                                ajaxData[modelName] = model.get(modelName).toArray();
                                if (ajaxData[modelName].length > 0 && controller.get("pageLength")) {
                                    var pl = controller.get("pageLength");
                                    if (ajaxData[modelName].length < pl) {
                                        var length = ajaxData[modelName].length;
                                        for (var i = 0; i < (pl - length); i++) {
                                            ajaxData[modelName][i + length] = [];
                                        }
                                    }
                                }
                                callback(
                                    ajaxData
                                );
                            } else {
                                setTimeout(function() {
                                    callsb(interval + 1);
                                }, interval * 1000);
                            }
                        };
                        callsb();
                    } else {
                        $('.dataTables_processing').css("display", "none");
                        controller.set("abortTransition", false);
                    }
                };
            }

            if (controller.get("pageLength")) {
                datatableObj.pageLength = controller.get("pageLength");
            }
            this.datatable = this.$table.DataTable(datatableObj);
            window.dt = this.datatable;
            return this;
        },



        events: function() {
            var _self = this;

            this.$table
                .on('click', 'a.save-row', function(e) {
                    e.preventDefault();

                    _self.rowSave($(this).closest('tr'));
                })
                .on('click', 'a.cancel-row', function(e) {
                    e.preventDefault();

                    _self.rowCancel($(this).closest('tr'));
                })
                .on('click', 'a.edit-row', function(e) {
                    e.preventDefault();

                    _self.rowEdit($(this).closest('tr'));
                })
                .on('click', 'a.remove-row', function(e) {
                    e.preventDefault();

                    var $row = $(this).closest('tr');

                    $.magnificPopup.open({
                        items: {
                            src: _self.options.dialog.wrapper,
                            type: 'inline'
                        },
                        preloader: false,
                        modal: true,
                        callbacks: {
                            change: function() {
                                _self.dialog.$confirm.on('click', function(e) {
                                    e.preventDefault();

                                    _self.rowRemove($row);
                                    $.magnificPopup.close();
                                });
                            },
                            close: function() {
                                _self.dialog.$confirm.off('click');
                            }
                        }
                    });
                });

            // this.$addButton.on( 'click', function(e) {
            // 	e.preventDefault();
            //
            // 	_self.rowAdd();
            // });

            this.dialog.$cancel.on('click', function(e) {
                e.preventDefault();
                $.magnificPopup.close();
            });

            return this;
        },

        // ==========================================================================================
        // ROW FUNCTIONS
        // ==========================================================================================
        rowAdd: function() {
            this.$addButton.attr({
                'disabled': 'disabled'
            });

            var actions,
                data,
                $row;

            actions = [
                '<a href="#" class="hidden on-editing save-row"><i class="fa fa-save"></i></a>',
                '<a href="#" class="hidden on-editing cancel-row"><i class="fa fa-times"></i></a>',
                '<a href="#" class="on-default edit-row"><i class="fa fa-pencil"></i></a>',
                '<a href="#" class="on-default remove-row"><i class="fa fa-trash-o"></i></a>'
            ].join(' ');

            data = this.datatable.row.add(['', '', '', '', '', actions]);
            $row = this.datatable.row(data[0]).nodes().to$();

            $row
                .addClass('adding')
                .find('td:last')
                .addClass('actions');

            this.fromAdd = true;
            this.rowEdit($row);

            this.datatable.order([0, 'asc']).draw(); // always show fields
        },

        rowCancel: function($row) {
            var $actions,
                data;

            if ($row.hasClass('adding')) {
                this.rowRemove($row);
            } else {

                data = this.datatable.row($row.get(0)).data();
                this.datatable.row($row.get(0)).data(data);

                $actions = $row.find('td.actions');
                if ($actions.get(0)) {
                    this.rowSetActionsDefault($row);
                }

                this.datatable.draw();
            }
        },

        rowEdit: function($row) {
            var _self = this,
                data;

            data = this.datatable.row($row.get(0)).data();

            $row.children('td').each(function(i) {
                var $this = $(this);

                if ($this.hasClass('actions')) {
                    _self.rowSetActionsEditing($row);
                } else if (_self.fromAdd) {
                    $this.html('<input type="text" class="form-control input-block" value="' + data[i] + '"/>');
                }
            });
            _self.fromAdd = false;
        },

        rowSave: function($row) {
            var _self = this,
                $actions,
                values = [];

            if ($row.hasClass('adding')) {
                this.$addButton.removeAttr('disabled');
                $row.removeClass('adding');
            }

            values = $row.find('td').map(function() {
                var $this = $(this);

                if ($this.hasClass('actions')) {
                    _self.rowSetActionsDefault($row);
                    return _self.datatable.cell(this).data();
                } else {
                    return $.trim($this.find('input').val());
                }
            });

            this.datatable.row($row.get(0)).data(values);

            $actions = $row.find('td.actions');
            if ($actions.get(0)) {
                this.rowSetActionsDefault($row);
            }

            this.datatable.draw();
        },

        rowRemove: function($row) {
            if ($row.hasClass('adding')) {
                this.$addButton.removeAttr('disabled');
            }

            this.datatable.row($row.get(0)).remove().draw();
        },

        rowSetActionsEditing: function($row) {
            $row.find('.on-editing').removeClass('hidden');
            $row.find('.on-default').addClass('hidden');
        },

        rowSetActionsDefault: function($row) {
            $row.find('.on-editing').addClass('hidden');
            $row.find('.on-default').removeClass('hidden');
        }

    };

    $(function() {
        // EditableTable.initialize();
        window.EditableTable = EditableTable;
    });

}).apply(this, [jQuery]);

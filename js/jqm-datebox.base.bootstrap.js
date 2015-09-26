/* jQuery-Mobile-DateBox */

/* CORE Functions */

(function( $ ) {

if (
	typeof($.jtsage.datebox) !== "undefined" && 
	typeof($.jtsage.datebox.prototype.baseMode) === "undefined"
) {
	$.extend( $.jtsage.datebox.prototype.options, {
		themeDateToday: "info",
		themeDayHigh: "warning",
		themeDatePick: "success",
		themeDateHigh: "warning",
		themeDateHighAlt: "danger",
		themeDateHighRec: "warning",
		themeDate: "default",

		bootstrapDropdown: true,
		bootstrapDropdownRight: true,

		bootstrapModal: false,
		
		calNextMonthIcon: "plus",
		calPrevMonthIcon: "minus",

		btnCls: " btn btn-sm btn-",
		icnCls: " glyphicon glyphicon-",

		s: {
			cal: {
				prevMonth : "<span title='{text}' class='glyphicon glyphicon-{icon}'></span>",
				nextMonth : "<span title='{text}' class='glyphicon glyphicon-{icon}'></span>",
				botButton : "<a href='#' class='{cls}' role='button'>" +
					"<span class='{icon}'></span> {text}</a>",
			}
		},

		clickEvent: "click",

	});
	$.extend( $.jtsage.datebox.prototype, {
		baseMode: "bootstrap",
		_stdBtn: {
			cancel: function() {
				var w = this, o = this.options;
				return $("<a href='#' role='button' class='btn btn-default'>" + 
						"<span class='" + o.icnCls + "remove'></span> " +
						w.__("cancelButton") + "</a>" )
					.on(o.clickEventAlt, function (e) {
						e.preventDefault();
						w._t({ method: "close", closeCancel: true });
					});
			},
			clear: function() {
				var w = this, o = this.options;
				return $( "<a href='#' role='button' class='btn btn-sm btn-default'>" + 
						"<span class='" + o.icnCls + "erase'></span> " +
						w.__("clearButton") + "</a>" )
					.on(o.clickEventAlt, function(e) {
						e.preventDefault();
						w.d.input.val("");
						w._t( { method: "clear" } );
						w._t( { method: "close", closeCancel: true } );
					});
			},
			close: function(txt) {
				var w = this, o = this.options;
				return $( "<a href='#' role='button'>" + txt + "</a>" )
					.addClass( "ui-btn ui-btn-" + o.themeSetButton + 
						" ui-icon-check ui-btn-icon-left ui-shadow ui-corner-all" +
						( ( w.dateOK === true ) ? "" : " ui-state-disabled" )
					)
					.on(o.clickEventAlt, function(e) {
						e.preventDefault();
						if ( w.dateOK === true ) {
							w._t( { 
								method: "set", 
								value: w._formatter(w.__fmt(),w.theDate),
								date: w.theDate
							} );
							w._t( { method: "close" } );
						}
						
					});
			}
		},
		_destroy: function() {
			var w = this,
				o = this.options,
				button = this.d.wrap.find( ".input-group-addon" );


			if ( o.useButton === true ) {
				button.remove();
				w.d.input.unwrap();	
			}

			if ( o.lockInput ) {
				w.d.input.removeAttr( "readonly" );
			}

			w.d.input
				.off( "datebox" )
				.off( "focus.datebox" )
				.off( "blur.datebox" )
				.off( "change.datebox" );

			//w.d.mainWrap.popup("destroy");
				
			$( document )
				.off( w.drag.eMove )
				.off( w.drag.eEnd )
				.off( w.drag.eEndA );
		},
		_create: function() {
			// Create the widget, called automatically by widget system
			$( document ).trigger( "dateboxcreate" );

			var w = this,
				o = $.extend(
					this.options,
					this._getLongOptions( this.element ),
					this.element.data( "options" )
				),
				thisTheme = ( ( o.theme === false ) ?
					"default" :
					o.theme
				),
				d = {
					input: this.element,
					wrap: this.element.parent(),
					mainWrap: $( "<div>", { 
						"class": "ui-datebox-container"
						} ).css( "zIndex", o.zindex ),
					intHTML: false
				},
				evtid = ".datebox" + this.uuid,
				touch = ( typeof window.ontouchstart !== "undefined" ),
				drag = {
					eStart : "touchstart" + evtid + " mousedown" + evtid,
					// (touch ? "touchstart" : "mousedown" ) + evtid,
					eMove  : "touchmove" + evtid + " mousemove" + evtid,
					//(touch ? "touchmove" : "mousemove" ) + evtid,
					eEnd   : "touchend" + evtid + " mouseup" + evtid,
					//(touch ? "touchend" : "mouseup" ) + evtid,
					eEndA  : (true ?
						(["mouseup","touchend","touchcanel","touchmove"].join(evtid+" ") + evtid) :
						"mouseup" + evtid
					),
					move   : false,
					start  : false,
					end    : false,
					pos    : false,
					target : false,
					delta  : false,
					tmp    : false
				};

			$.extend(w, {d: d, drag: drag, touch:touch});

			if ( o.usePlaceholder !== false ) {
				if ( o.usePlaceholder === true && w._grabLabel() !== "" ) { 
					w.d.input.attr( "placeholder", w._grabLabel());
				}
				if ( typeof o.usePlaceholder === "string" ) {
					w.d.input.attr( "placeholder", o.usePlaceholder );
				}
			}

			o.theme = thisTheme;

			w.cancelClose = false;
			w.calBackDate = false;
			w.calDateVisible = true;
			w.disabled = false;
			w.runButton = false;
			w._date = window.Date;
			w._enhanceDate();
			w.baseID = w.d.input.attr( "id" );

			w.initDate = new w._date();
			w.initDate.setMilliseconds(0);
			w.theDate = ( o.defaultValue ) ?
				w._makeDate() :
				( (w.d.input.val() !== "" ) ?
					w._makeDate( w.d.input.val() ) :
					new w._date() );

			if ( w.d.input.val() === "" ) { w._startOffset( w.theDate ); }

			w.initDone = false;

			if ( o.showInitialValue ) {
				w.d.input.val( w._formatter( w.__fmt(), w.theDate ) );
			}

			if ( o.useButton ) {
				if ( o.mode !== false ) {
					w.d.wrap = w.d.input.wrap("<div class='input-group'>").parent();
					if ( o.buttonIcon === false ) {
						if ( o.mode.substr( 0, 4 ) === "time" || o.mode.substr( 0 ,3 ) === "dur" ) {
							o.buttonIcon = o.buttonIconTime;
						} else {
							o.buttonIcon = o.buttonIconDate;
						}
					}
					$( "<div class='input-group-addon'>" +
							"<span class='" + o.icnCls + o.buttonIcon + "'></span>" + 
							"</div>" )
						.attr( "title", w.__( "tooltip" ) )
						.on(o.clickEvent, function( e ) {
							e.preventDefault();
							if ( o.useFocus ) {
								w.d.input.focus();
							} else {
								if ( !w.disabled ) { w._t( { method: "open" } ); }
							}
						})
						.appendTo(w.d.wrap);
				}
			}

			if ( o.hideInput ) { w.d.wrap.hide(); }
			if ( o.hideContainer ) { w.d.wrap.parent().hide(); }

			w.d.input
				.on( "focus.datebox", function(){
					w.d.input.addClass( "ui-focus" );
					if ( w.disabled === false && o.useFocus ) {
						w._t( { method: "open" } );
					}
				})
				.on( "blur.datebox", function() { 
					w.d.input.removeClass( "ui-focus" ); 
				})
				.on( "change.datebox", function() {
					w.theDate = w._makeDate( w.d.input.val() );
					w.refresh();
				})
				.on( "datebox", w._event );

			if ( o.lockInput ) { 
				w.d.input.attr( "readonly", "readonly" ); 
			}

			// Check if mousewheel plugin is loaded
			if ( typeof $.event.special.mousewheel !== "undefined" ) {
				w.wheelExists = true;
			}

			// Disable when done if element attribute disabled is true.
			if ( w.d.input.is( ":disabled" ) ) {
				w.disable();
			}

			w.applyMinMax(false, false);

			if ( o.useInline || o.useInlineBlind ) {
				w.open();
			}

			//Throw dateboxinit event
			$( document ).trigger( "dateboxaftercreate" );
		},
		open: function () {
			// PUBLIC function to open the control
			var w = this,
				o = this.options,
				basepop = {};

			if ( o.useFocus && w.fastReopen === true ) { 
				w.d.input.blur();
				return false;
			}

			w.theDate = w._makeDate( w.d.input.val() );
			w.calBackDate = false;
			if ( w.d.input.val() === "" ) { w._startOffset( w.theDate ); }
			w.d.input.blur();

			if ( typeof w._build[ o.mode ] === "undefined" ) {
				w._build[ "default" ].apply( w, [] );
			} else {
				w._build[ o.mode ].apply( w, [] );
			}
			if ( typeof w._drag[ o.mode ] !== "undefined" ) {
				w._drag[ o.mode ].apply( w, [] );
			}

			w._t( { method: "refresh" } );

			if ( w.__( "useArabicIndic" ) === true ) { w._doIndic(); }

			if ( ( o.useInline || o.useInlineBlind ) && w.initDone === false ) {
				w.d.mainWrap.append( w.d.intHTML );
				
				if ( o.hideContainer ) {
					if ( o.useHeader ) {
						w.d.mainWrap.prepend( $( "<div class='ui-header ui-bar-" + o.themeHeader +
							"'>" + "<h1 class='ui-title'>" + w.d.headerText + "</h1>" + "</div>" )
						);
					}
					w.d.wrap.parent().after( w.d.mainWrap );
				} else {
					w.d.wrap.parent().append( w.d.mainWrap );
				}
				w.d.mainWrap.removeClass( "ui-datebox-hidden ui-overlay-shadow" );
				if ( o.useInline ) {
					w.d.mainWrap
						.addClass( "ui-datebox-inline" )
						.css( "zIndex", "auto" );
						
					if ( !o.hideInput && !o.hideContainer ) {
						w.d.mainWrap.addClass("ui-datebox-inline-has-input");
					} 
					// This is really hacky.  I hate it, but I don't have a 
					// better idea right now.  Cleans up position on flip variants.
					setTimeout( (function(w) { 
						return function() {
							w._t( { method: "postrefresh" } );
						};
					}(w)), 100);
					return true;
				} else {
					w.d.mainWrap
						.addClass( "ui-datebox-inline ui-datebox-inline-has-input" )
						.css( "zIndex", "auto" );
					w.d.mainWrap.hide();
				}
				w.initDone = false;
				w._t( { method: "postrefresh" } );
			}

			if ( o.useInlineBlind ) {
				if ( w.initDone ) { 
					w.refresh();
					w.d.mainWrap.slideDown();
					w._t( { method: "postrefresh" } );
				} else { 
					w.initDone = true; 
				}
				return true;
			}

			// Ignore if already open
			if ( w.d.intHTML.is( ":visible" ) ) { return false; }

			w.d.mainWrap.empty();

			if ( o.useHeader ) {

				w.d.mainWrap.append( $(w._spf(
						"<div class='{c1}'><h4 class='{c2}'>" +
						"<span class='{c3}'></span>{text}</h4></div>",
					{
						c1: "modal-header",
						c2: "modal-title text-center",
						c3: "closer" + o.icnCls + "remove pull-" + o.popupButtonPosition,
						text: w.d.headerText,
					}))
				).find( ".closer" ).on( o.clickEventAlt, function( e ) {
					e.preventDefault();
					w._t( { method: "close", closeCancel: true } );
				} );
			}
			
			w.d.mainWrap.append( w.d.intHTML ).css( "zIndex", o.zindex );

			w._t( { method: "postrefresh" } );


			// Perpare open callback, if provided. Additionally, if this
			// returns false then the open/update will stop.
			if ( o.openCallback !== false ) {
				if ( ! $.isFunction( o.openCallback ) ) {
					if ( typeof window[ o.openCallback ] === "function" ) {
						o.openCallback = window[ o.openCallback ];
					}
				}
				basepop.afteropen = function() {
					w._t( { method: "postrefresh" } );
					if ( o.openCallback.apply( w, $.merge([{
								custom: w.customCurrent,
								initDate: w.initDate,
								date: w.theDate,
								duration: w.lastDuration
							}], o.openCallbackArgs ) ) === false ) {

						w._t( {method: "close"} );
					}
				};
			} else {
				basepop.afteropen = function() {
					w._t( { method: "postrefresh" } );
				};
			}

			// // Prepare close callback.
			if ( o.closeCallback !== false ) {
				if ( ! $.isFunction( o.closeCallback ) ) {
					if ( typeof window[ o.closeCallback ] === "function" ) {
						o.closeCallback = window[ o.closeCallback ];
					}
				}
				basepop.afterclose = function() {
					o.closeCallback.apply( w, $.merge([{
						custom: w.customCurrent,
						initDate: w.initDate,
						date: w.theDate,
						duration: w.lastDuration,
						cancelClose: w.cancelClose
					}], o.closeCallbackArgs ) );
				};
			} else {
				basepop.afteropen = function() {
					return true;
				};
			}

			// Perpare BEFORE open callback, if provided. Additionally, if this
			// returns false then the open/update will stop.
			if ( o.beforeOpenCallback !== false ) {
				if ( ! $.isFunction( o.beforeOpenCallback ) ) {
					if ( typeof window[ o.beforeOpenCallback ] === "function" ) {
						o.beforeOpenCallback = window[ o.beforeOpenCallback ];
					}
				}
				if ( o.beforeOpenCallback.apply( w, $.merge([{
						custom: w.customCurrent,
						initDate: w.initDate,
						date: w.theDate,
						duration: w.lastDuration
					}], o.beforeOpenCallbackArgs ) ) === false ) {
						return false;
				}
			}

			if ( o.bootstrapDropdown === true && o.bootstrapModal === false ) {
				w.d.mainWrap
					.addClass( "dropdown-menu" )
					.addClass( ( o.useAnimation ? o.transition : "" ) )
					.addClass( ( o.bootstrapDropdownRight === true ) ? "dropdown-menu-right" : "" )
					.appendTo(w.d.wrap)
					.on( "transitionend", function() { 
						if ( w.d.mainWrap.is( ":visible" ) ) {
							basepop.afteropen.call();
						} else {
							basepop.afterclose.call();
							w.d.wrap.removeClass( "open" );
						}
					});

				w.d.wrap.addClass( "open" );

				w.d.backdrop = $("<div></div>")
	          		.css({ position: "fixed", left: 0, top: 0, bottom: 0, right: 0 })
	          		.appendTo( "body" )
	          		.on( o.clickEvent, function (e) {
	          			e.preventDefault();
						w._t( { method: "close", closeCancel: true } );
					});

				window.setTimeout(function () {
	    			w.d.mainWrap.addClass( "in" );
				}, 0);
			}
		},
		close: function() {
			// Provide a PUBLIC function to close the element.
			var w = this,
				o = this.options;

			w.calBackDate = false;
			
			if ( o.useInlineBlind ) { 
				// Slide up useInlineBlind
				w.d.mainWrap.slideUp();
				return true;
			}
			if ( o.useInline || w.d.intHTML === false ) { 
				// Do nothing for useInline or empty.
				return true;
			}

			// Trigger the popup to close
			if ( o.bootstrapDropdown === true && o.bootstrapModal === false ) {
				if ( o.useAnimation === true ) {
					w.d.mainWrap.removeClass( "in");
					w.d.backdrop.remove();
				} else {
					w.d.wrap.removeClass( "open" );
					w.d.backdrop.remove();
				}
			}

			// Unbind all drag handlers.
			$( document )
				.off( w.drag.eMove )
				.off( w.drag.eEnd )
				.off( w.drag.eEndA );

			if ( o.useFocus ) {
				w.fastReopen = true;
				setTimeout( (function( t ) { 
					return function () { 
						t.fastReopen = false; 
					};
				}( w )), 300 );
			}
		},
		disable: function() {
			var w = this;
			// Provide a PUBLIC function to Disable the element
			w.d.input.attr( "disabled", true );
			w.disabled = true;
			w._t( { method: "disable"});
		},
		enable: function() {
			var w = this;
			// Provide a PUBLIC function to Enable the element
			w.d.input.attr( "disabled", false );
			w.disabled = false;
			w._t( { method: "enable" });
		}
	});
}

$(document).ready( function() {
	$( "[data-role='datebox']" ).each( function() {
		$( this ).datebox();
	});
});

})( jQuery );

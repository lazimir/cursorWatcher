CursorWatcher = function() {
    var p = arguments[0] || {};

    this.dataUrl = p.dataUrl || '?';
    this.sendInterval = p.sendInterval || 0;
    this.minStayTime = p.minStayTime || 30;

    var that = this;
    var movementsData = [];
    var movementsDataSendBuffer = [];
    var lastRecordTime = 0;

    var currentPositionData, sendTimerId, image;

    var mouseMoveHandler = function(e) {
        var time = $.now();
        var timeDif = time - lastRecordTime;
        if ((timeDif >= that.minStayTime) || (e.type == 'mouseout')) {
            if (currentPositionData !== undefined) {
                currentPositionData['t'] = timeDif;
                movementsDataSendBuffer.push(currentPositionData);
                movementsData.push(currentPositionData);
            }
            lastRecordTime = time;
            currentPositionData = {x: e.pageX, y: e.pageY, t: 0};
        }
    };

    var mouseOutHandler = function(e) {
        if (e.relatedTarget === null) {
            mouseMoveHandler(e);
        }
    };

    this.start = function() {
        movementsData = [];

        $(document).mousemove(mouseMoveHandler);
        $(document).mouseout(mouseOutHandler);

        if (this.sendInterval != 0) {
            sendTimerId = setInterval(this.sendMovements, this.sendInterval);
        }
    };

    this.stop = function() {
        if (sendTimerId !== undefined) {
            clearTimeout(sendTimerId);
        }

        $(document).unbind('mousemove', mouseMoveHandler);
        $(document).unbind('mouseout', mouseOutHandler);

        if (currentPositionData !== undefined) {
            currentPositionData['t'] = $.now() - lastRecordTime;
            movementsDataSendBuffer.push(currentPositionData);
            currentPositionData = undefined;
            if ((movementsDataSendBuffer.length > 0) && (that.sendInterval > 0)) {
                that.sendMovements();
            }
        }
    };

    this.sendMovements = function() {
        if (movementsDataSendBuffer.length > 0) {
            var bufer = movementsDataSendBuffer.slice();
            movementsDataSendBuffer = [];

            if (image === undefined) {
                image = new Image();
            }
            image.src = that.dataUrl + encodeURIComponent(JSON.stringify(bufer));
        }
    };

    this.repeatMovements = function(cursoDivId) {
        var cursor = $('#' + cursoDivId);
        $.map(movementsData, function(value) {
            cursor.animate({top: value.y, left: value.x}, value.t);
        });
    }
};

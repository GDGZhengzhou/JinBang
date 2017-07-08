/*
 * @Author: ZHC
 * @Date:   2017-07-03 14:43:49
 * @Last Modified by:   ZHC
 * @Last Modified time: 2017-07-06 21:32:19
 */

'use strict';

const YXDHLINK = "http://www.heao.gov.cn/JHCX/PZ/enrollplan/PCList.aspx?YXDH=",
    WENKELINE = 516,
    LIKELINE = 484,
    TYPE_WK = 1,
    TYPE_LK = 5,
    TYPE_PC = 1;


$(function() {
    $("#hope").bind('click', function(event) {
        attemptHope();
    });
    backToTop();
});

function attemptHope() {
    let score = $("#exam-score").val();
    let kl = $(":checked[name='kl']").val();
    let pc = $(":checked[name='pc']").val();

    if (!score) {
        showHopeAlertDialog();
        return;
    }

    if (kl == TYPE_WK && pc == TYPE_PC && score < WENKELINE) {
        showAlertDialog('🙀', '您的考分低于文科一本线 ' + WENKELINE + ' 分，请选择第二批次');
        return;
    } else if (kl == TYPE_LK && pc == TYPE_PC && score < LIKELINE) {
        showAlertDialog('🙀', '您的考分低于理科一本线 ' + LIKELINE + ' 分，请选择第二批次');
        return;
    }

    hideDataView();
    showLoadingView();
    let hopeData = JinBang.hope(pc, kl, score);
    console.log(hopeData);
    if (hopeData) {
        renderHopeDataToTargetView(score, hopeData);
        hideLoadingView();
        showDataView();
    } else {
        hideLoadingView();
        showDataView();
        showToast("#toast-view", "预测失败啦😔");
    }
}

function showHopeAlertDialog() {
    showAlertDialog('🙀', '请输入你的考分哦😘');
}

function renderHopeDataToTargetView(score, hopeData) {
    let targetSelector = "#rush";
    hopeData.forEach(function(element) {
        let firstRowData = {};
        let length = element.length;
        firstRowData.rowspan = length - 4;
        firstRowData.hope_score = element[0];
        firstRowData.last_year_score = element[1];
        firstRowData.competition_count = element[2];
        firstRowData.advantage_count = element[3];
        firstRowData.url = YXDHLINK + element[4];
        firstRowData.name = findSchoolNameWithCode(element[4]);
        if (score < firstRowData.hope_score) {
            targetSelector = "#rush";
        } else if (score - 10 < firstRowData.hope_score) {
            targetSelector = "#keep";
        } else {
            targetSelector = "#steady";
        }
        $("#school-data-first-row").tmpl(firstRowData).appendTo(targetSelector);

        let schools = element.slice(5, length);
        schools.forEach(function(element) {
            let school = {};
            school.url = YXDHLINK + element;
            school.name = findSchoolNameWithCode(element);
            $("#school-data-row").tmpl(school).appendTo(targetSelector);
        });
    });
}

function showDataView() {
    $("#hope-data-view").show();
}

function hideDataView() {
    $("#hope-data-view").hide();
}

function showLoadingView() {
    $("#loading-view").show();
}

function hideLoadingView() {
    $("#loading-view").hide();
}

function showAlertDialog(title, msg) {
    let dialog = document.querySelector('dialog');
    $(dialog).find('.mdl-dialog__title').text(title)
    $(dialog).find('b').text(msg);
    if (!dialog.showModal) {
        dialogPolyfill.registerDialog(dialog);
    }
    dialog.showModal();
    $('.close').unbind('click').bind('click', function() {
        dialog.close();
    });
}

function showToast(selector, msg) {
    let snackbarContainer = document.querySelector(selector);
    let data = { message: msg };
    snackbarContainer.MaterialSnackbar.showSnackbar(data);
}

function findSchoolNameWithCode(code) {
    return JinBang.schools[code]['院校名称']
}

function backToTop() {
    $('.zh-backtotop').toTop();
    $(window).scroll(function() {
        if ($(this).scrollTop() > 100) {
            $('.zh-backtotop').fadeIn();
        } else {
            $('.zh-backtotopba').fadeOut();
        }
    });
    $('.zh-backtotop').on('click', function(e) {
        e.preventDefault();
        $('html, body').animate({ scrollTop: 0 }, 1000);
        return false;
    });
}
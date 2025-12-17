/* global $ */

$(() => {
  const tableId = $("#datatable")
  const datatableForm = $("#datatableForm")

  var table
  const baseURL = window.baseURL // Declare baseURL
  const itemSettings = window.itemSettings // Declare itemSettings
  const setTooltip = window.setTooltip // Declare setTooltip
  const confirmAction = window.confirmAction // Declare confirmAction
  const iziToast = window.iziToast // Declare iziToast
  const beforeCallAjaxRequest = window.beforeCallAjaxRequest // Declare beforeCallAjaxRequest

  function saveFilters() {
    const filters = {
      brand_id: $("#brand_id").val(),
      item_category_id: $("#item_category_id").val(),
      is_service: $("#is_service").val(),
      user_id: $("#user_id").val(),
      warehouse_id: $("#warehouse_id").val(),
      tracking_type: $("#tracking_type").val(),
    }
    localStorage.setItem("item_list_filters", JSON.stringify(filters))
  }

  function restoreFilters() {
    const savedFilters = localStorage.getItem("item_list_filters")
    if (savedFilters) {
      const filters = JSON.parse(savedFilters)

      if (filters.brand_id) $("#brand_id").val(filters.brand_id).trigger("change")
      if (filters.item_category_id) $("#item_category_id").val(filters.item_category_id).trigger("change")
      if (filters.is_service) $("#is_service").val(filters.is_service).trigger("change")
      if (filters.user_id) $("#user_id").val(filters.user_id).trigger("change")
      if (filters.warehouse_id) $("#warehouse_id").val(filters.warehouse_id).trigger("change")
      if (filters.tracking_type) $("#tracking_type").val(filters.tracking_type).trigger("change")
    }
  }

  /**
   *Server Side Datatable Records
   */
  function loadDatatables() {
    if ($.fn.DataTable.isDataTable(tableId)) {
      tableId.DataTable().destroy()
    }

    var exportColumns = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]

    table = tableId.DataTable({
      processing: true,
      serverSide: true,
      method: "get",
      pageLength: 100,
      lengthMenu: [10, 25, 50, 100, 200, 500],
      stateSave: true,
      ajax: {
        url: baseURL + "/item/datatable-list",
        data: {
          brand_id: $("#brand_id").val(),
          item_category_id: $("#item_category_id").val(),
          is_service: $("#is_service").val(),
          created_by: $("#user_id").val(),
          warehouse_id: $("#warehouse_id").val(),
          tracking_type: $("#tracking_type").val(),
        },
      },
      columns: [
        { targets: 0, data: "id", orderable: true, visible: false },
        {
          data: "id",
          orderable: false,
          className: "text-center",
          render: (data, type, full, meta) =>
            '<input type="checkbox" class="form-check-input row-select" name="record_ids[]" value="' + data + '">',
        },
        {
          data: "name",
          render: (data, type, full, meta) => {
            const item_location = full.item_location || ""

            const editableName =
              `<span class="editable-cell"
                  data-id="` +
              full.id +
              `"
                  data-field="name"
                  contenteditable="true">` +
              data +
              `</span>`

            if (item_location != "") {
              return (
                editableName +
                `
                <br>
                <span class="badge text-primary bg-light-primary p-2 text-uppercase px-3"
                      data-bs-toggle="tooltip"
                      data-bs-placement="top"
                      title="Location">
                    ` +
                item_location +
                `
                    <i class="fadeIn bx bx-sm bx-location-plus"></i>
                </span>
            `
              )
            }

            return editableName
          },
        },
        { data: "item_code", name: "item_code" },
        { data: "sku", name: "sku", visible: itemSettings.sku == 1 ? true : false, orderable: false },
        { data: "brand_name", name: "brand_name", orderable: false },
        { data: "category_name", name: "category_name", orderable: false },
        {
          data: "sale_price",
          name: "sale_price",
          className: "text-end",
          render: (data, type, full, meta) =>
            `<span class="editable-cell"
                  data-id="` +
            full.id +
            `"
                  data-field="sale_price"
                  contenteditable="true">` +
            data +
            `</span>`,
        },
        {
          data: "purchase_price",
          name: "purchase_price",
          className: "text-end",
          render: (data, type, full, meta) =>
            `<span class="editable-cell"
                  data-id="` +
            full.id +
            `"
                  data-field="purchase_price"
                  contenteditable="true">` +
            data +
            `</span>`,
        },
        {
          data: "mrp",
          name: "mrp",
          className: "text-end",
          render: (data, type, full, meta) =>
            `<span class="editable-cell fw-bold text-primary"
                  data-id="` +
            full.id +
            `"
                  data-field="mrp"
                  contenteditable="true">` +
            (data || 0) +
            `</span>`,
        },
        {
          data: "base_unit_name",
          name: "base_unit_name",
          className: "text-center",
          render: (data, type, full, meta) =>
            '<span class="badge bg-light-primary text-primary">' + (data || "-") + "</span>",
        },
        {
          data: "current_stock",
          name: "current_stock",
          className: "text-left",
          render: (data, type, full, meta) => {
            const numericValue = data.toString().replace(/[^0-9.]/g, "") || data

            return (
              `<span class="editable-cell"
                  data-id="` +
              full.id +
              `"
                  data-field="current_stock"
                  contenteditable="true">` +
              numericValue +
              `</span>` +
              (data.toString().includes(" ")
                ? '<span class="text-muted ms-1">(' + data.toString().split(" ").slice(-1) + ")</span>"
                : "")
            )
          },
        },
        {
          data: "action",
          name: "action",
          orderable: false,
          searchable: false,
          render: (data, type, full, meta) => {
            const itemId = full.id
            const editUrl = baseURL + "/item/edit/" + itemId
            const transactionUrl = baseURL + "/item/transaction/" + itemId

            return (
              `<div class="dropdown">
                  <button class="btn btn-sm btn-light dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                      <i class="bx bx-dots-vertical-rounded"></i>
                  </button>
                  <ul class="dropdown-menu">
                      <li>
                          <a class="dropdown-item" href="` +
              editUrl +
              `">
                              <i class="bx bx-edit-alt me-2"></i>Edit
                          </a>
                      </li>
                      <li>
                          <a class="dropdown-item stock-edit-btn" href="` +
              editUrl +
              `#successprofile" data-id="` +
              itemId +
              `">
                              <i class="bx bx-package me-2"></i>Stock Edit
                          </a>
                      </li>
                      <li>
                          <a class="dropdown-item" href="` +
              transactionUrl +
              `">
                              <i class="bx bx-transfer me-2"></i>Transactions
                          </a>
                      </li>
                      <li><hr class="dropdown-divider"></li>
                      <li>
                          <a class="dropdown-item text-danger deleteRequest" href="javascript:void(0)" data-delete-id="` +
              itemId +
              `">
                              <i class="bx bx-trash me-2"></i>Delete
                          </a>
                      </li>
                  </ul>
              </div>`
            )
          },
        },
      ],

      dom:
        "<'row' " +
        "<'col-sm-12' " +
        "<'float-start' l" +
        ">" +
        "<'float-end' fr" +
        ">" +
        "<'float-end ms-2'" +
        "<'card-body ' B >" +
        ">" +
        ">" +
        ">" +
        "<'row'<'col-sm-12'tr>>" +
        "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>",

      buttons: [
        {
          className: "btn btn-outline-danger buttons-copy buttons-html5 multi_delete",
          text: "Delete",
          action: (e, dt, node, config) => {
            requestDeleteRecords()
          },
        },
        {
          extend: "copyHtml5",
          exportOptions: {
            columns: exportColumns,
          },
        },
        {
          extend: "excelHtml5",
          exportOptions: {
            columns: exportColumns,
          },
        },
        {
          extend: "csvHtml5",
          exportOptions: {
            columns: exportColumns,
          },
        },
        {
          extend: "pdfHtml5",
          orientation: "portrait",
          exportOptions: {
            columns: exportColumns,
          },
        },
        {
          text: '<i class="bx bx-refresh"></i>',
          className: "btn btn-outline-secondary",
          action: (e, dt, node, config) => {
            dt.ajax.reload()
          },
        },
      ],

      select: {
        style: "os",
        selector: "td:first-child",
      },
      order: [[0, "desc"]],
      drawCallback: () => {
        setTooltip()
      },
    })

    table.on("click", ".deleteRequest", function () {
      const deleteId = $(this).attr("data-delete-id")
      deleteRequest(deleteId)
    })

    $(".dataTables_length, .dataTables_filter, .dataTables_info, .dataTables_paginate").wrap(
      "<div class='card-body py-3'>",
    )
  }

  tableId.find("thead").on("click", ".row-select", function () {
    var isChecked = $(this).prop("checked")
    tableId.find("tbody .row-select").prop("checked", isChecked)
  })

  function countCheckedCheckbox() {
    var checkedCount = $('input[name="record_ids[]"]:checked').length
    return checkedCount
  }

  async function validateCheckedCheckbox() {
    const confirmed = await confirmAction()
    if (!confirmed) {
      return false
    }
    if (countCheckedCheckbox() == 0) {
      iziToast.error({ title: "Warning", layout: 2, message: "Please select at least one record to delete" })
      return false
    }
    return true
  }

  async function deleteRequest(id) {
    const confirmed = await confirmAction()
    if (confirmed) {
      deleteRecord(id)
    }
  }

  async function requestDeleteRecords() {
    const confirmed = await confirmAction()
    if (confirmed) {
      datatableForm.trigger("submit")
    }
  }

  datatableForm.on("submit", function (e) {
    e.preventDefault()

    const form = $(this)
    const formArray = {
      formId: form.attr("id"),
      csrf: form.find('input[name="_token"]').val(),
      _method: form.find('input[name="_method"]').val(),
      url: form.closest("form").attr("action"),
      formObject: form,
      formData: new FormData(document.getElementById(form.attr("id"))),
    }
    ajaxRequest(formArray)
  })

  function deleteRecord(id) {
    const form = datatableForm
    const formArray = {
      formId: form.attr("id"),
      csrf: form.find('input[name="_token"]').val(),
      _method: form.find('input[name="_method"]').val(),
      url: form.closest("form").attr("action"),
      formObject: form,
      formData: new FormData(),
    }
    formArray.formData.append("record_ids[]", id)
    ajaxRequest(formArray)
  }

  function ajaxRequest(formArray) {
    var jqxhr = $.ajax({
      type: formArray._method,
      url: formArray.url,
      data: formArray.formData,
      dataType: "json",
      contentType: false,
      processData: false,
      headers: {
        "X-CSRF-TOKEN": formArray.csrf,
      },
      beforeSend: () => {
        if (typeof beforeCallAjaxRequest === "function") {
          beforeCallAjaxRequest()
        }
      },
    })
    jqxhr.done((data) => {
      iziToast.success({ title: "Success", layout: 2, message: data.message })
    })
    jqxhr.fail((response) => {
      var message = response.responseJSON.message
      iziToast.error({ title: "Error", layout: 2, message: message })
    })
    jqxhr.always(() => {
      afterCallAjaxResponse(formArray.formObject)
    })
  }

  function afterCallAjaxResponse(formObject) {
    if (table) {
      table.ajax.reload(null, false)
    }
  }

  $(document).ready(() => {
    restoreFilters()
    loadDatatables()
  })

  $(document).on("change", "#brand_id, #item_category_id, #is_service, #user_id, #warehouse_id, #tracking_type", () => {
    saveFilters()
    loadDatatables()
  })

  $(document).on("keypress blur", ".editable-cell", function (e) {
    const $cell = $(this)
    const id = $cell.data("id")
    const field = $cell.data("field")
    const value = $cell.text().trim()

    if (e.type === "keypress" && e.which !== 13) return
    if (e.which === 13) {
      e.preventDefault()
      $cell.blur()
      return
    }

    if (e.type !== "blur") return

    const originalValue = $cell.data("original-value")
    if (originalValue === value) return

    $.ajax({
      url: baseURL + "/item/update-inline",
      type: "POST",
      data: {
        id: id,
        field: field,
        value: value,
      },
      headers: {
        "X-CSRF-TOKEN": $("meta[name='csrf-token']").attr("content"),
      },
      success: (res) => {
        iziToast.success({
          title: "Updated",
          message: res.message,
        })
        $cell.data("original-value", value)
        if (table) {
          table.ajax.reload(null, false)
        }
      },
      error: (xhr) => {
        iziToast.error({
          title: "Error",
          message: xhr.responseJSON?.message || "Update failed",
        })
        if (originalValue !== undefined) {
          $cell.text(originalValue)
        }
      },
    })
  })

  $(document).on("focus", ".editable-cell", function () {
    $(this).data("original-value", $(this).text().trim())
  })
})

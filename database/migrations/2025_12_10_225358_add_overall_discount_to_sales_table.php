<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->decimal('overall_discount', 20, 4)->default(0)->after('grand_total');
            $table->string('overall_discount_type')->default('fixed')->after('overall_discount'); // 'fixed' or 'percentage'
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('sales', function (Blueprint $table) {
            $table->dropColumn(['overall_discount', 'overall_discount_type']);
        });
    }
};
